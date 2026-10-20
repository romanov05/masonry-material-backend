import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, LessThanOrEqual, MoreThan, Not, Repository } from 'typeorm';
import {
  MasonryMaterialServiceEntity,
  MasonryMaterialStatus,
} from './entities/masonry-material-service.entity';
import { MasonryMaterialLikeEntity } from './entities/masonry-material-like.entity';
import { MasonryMaterialMinioService } from './masonry-material-minio.service';
import { MasonryMaterialUploadedFile } from './masonry-material-uploaded-file';
import { CreateMasonryMaterialDto } from './dto/create-masonry-material.dto';
import { PublishMasonryMaterialDto } from './dto/publish-masonry-material.dto';
import {
  MasonryMaterialFeedQueryDto,
  MasonryMaterialFiltersDto,
} from './dto/masonry-material-query.dto';
import { MasonryMaterialResponse } from './dto/masonry-material-response';
import { isMasonryMaterialUniqueViolation } from '../masonry-material-database-errors';

@Injectable()
export class MasonryMaterialService {
  constructor(
    @InjectRepository(MasonryMaterialServiceEntity)
    private readonly materialRepository: Repository<MasonryMaterialServiceEntity>,
    @InjectRepository(MasonryMaterialLikeEntity)
    private readonly likeRepository: Repository<MasonryMaterialLikeEntity>,
    private readonly minioService: MasonryMaterialMinioService,
  ) {}

  // GET: список с фильтрацией — только опубликованные (currentUserId = null — гость)
  async getPublishedList(
    filters: MasonryMaterialFiltersDto,
    currentUserId: number | null,
  ): Promise<MasonryMaterialResponse[]> {
    const where: FindOptionsWhere<MasonryMaterialServiceEntity> = { status: 'published' };
    if (filters.maxConsumption !== undefined) {
      where.consumptionPerM3 = LessThanOrEqual(filters.maxConsumption);
    }
    const materials = await this.materialRepository.find({ where, order: { id: 'ASC' } });
    return this.toResponses(materials, currentUserId);
  }

  // GET: лента — только опубликованные, из БД всегда одна строка (findOne → LIMIT 1)
  async getFeedItem(
    query: MasonryMaterialFeedQueryDto,
    currentUserId: number | null,
  ): Promise<MasonryMaterialResponse> {
    const findFirstPublished = () =>
      this.materialRepository.findOne({ where: { status: 'published' }, order: { id: 'ASC' } });

    let material: MasonryMaterialServiceEntity | null;
    if (query.id === undefined) {
      // id нет только вместе с next=true (без параметров DTO вернёт 400) — первая карточка
      material = await findFirstPublished();
    } else if (query.next) {
      material =
        (await this.materialRepository.findOne({
          where: { status: 'published', id: MoreThan(query.id) },
          order: { id: 'ASC' },
        })) ?? (await findFirstPublished()); // дошли до конца — по кругу к первой
    } else {
      material = await this.materialRepository.findOne({ where: { id: query.id, status: 'published' } });
    }

    if (!material) {
      throw new NotFoundException();
    }
    return this.toResponse(material, currentUserId);
  }

  // GET: черновик текущего пользователя (не более одного)
  async getDraft(currentUserId: number): Promise<MasonryMaterialResponse> {
    const draft = await this.findDraftEntity(currentUserId);
    if (!draft) {
      throw new NotFoundException();
    }
    return this.toResponse(draft, currentUserId);
  }

  // POST: создание черновика + загрузка изображения и видео в MinIO
  async createDraft(
    currentUserId: number,
    dto: CreateMasonryMaterialDto,
    image: MasonryMaterialUploadedFile,
    video: MasonryMaterialUploadedFile,
  ): Promise<MasonryMaterialResponse> {
    if (await this.findDraftEntity(currentUserId)) {
      throw new ConflictException(); // черновик уже есть
    }

    const imageFileName = await this.minioService.uploadFile(image, 'image');
    let videoFileName: string;
    try {
      videoFileName = await this.minioService.uploadFile(video, 'video');
    } catch (error) {
      await this.minioService.removeFile(imageFileName);
      throw error;
    }

    try {
      const saved = await this.materialRepository.save(
        this.materialRepository.create({
          name: dto.name.trim(),
          status: 'draft',
          creatorId: currentUserId,
          imageUrl: imageFileName,
          videoUrl: videoFileName,
        }),
      );
      return this.toResponse(saved, currentUserId);
    } catch (error) {
      // запись в БД не удалась — файлы в MinIO не оставляем
      await Promise.all([
        this.minioService.removeFile(imageFileName),
        this.minioService.removeFile(videoFileName),
      ]);
      if (isMasonryMaterialUniqueViolation(error)) {
        throw new ConflictException(); // услуга с таким названием уже есть
      }
      throw error;
    }
  }

  // PUT: публикация — только свой черновик (статус draft → published)
  async publish(
    id: number,
    currentUserId: number,
    dto: PublishMasonryMaterialDto,
  ): Promise<MasonryMaterialResponse> {
    const draft = await this.findOwnMaterial(id, currentUserId); // 404 / 403
    if (draft.status !== 'draft') {
      throw new ConflictException(); // 409 — уже опубликована
    }

    draft.status = 'published';
    draft.shortDescription = dto.shortDescription.trim();
    draft.mortarPerM3 = dto.mortarPerM3;
    draft.consumptionPerM3 = dto.consumptionPerM3;
    draft.publishedAt = new Date(); // дата формирования вычисляется на бэкенде

    const saved = await this.materialRepository.save(draft);
    return this.toResponse(saved, currentUserId);
  }

  // DELETE: только soft delete и только свои услуги
  async softDelete(id: number, currentUserId: number): Promise<void> {
    await this.findOwnMaterial(id, currentUserId); // 404 / 403
    await this.materialRepository.update({ id }, { status: 'deleted' });
  }

  // POST: лайк от текущего пользователя — 1 ставит, 0 отменяет
  async setLike(id: number, currentUserId: number, value: 0 | 1): Promise<MasonryMaterialResponse> {
    const material = await this.materialRepository.findOne({ where: { id, status: 'published' } });
    if (!material) {
      throw new NotFoundException();
    }

    if (value === 1) {
      // ON CONFLICT DO NOTHING — повторный лайк не создаёт дубликат
      await this.likeRepository
        .createQueryBuilder()
        .insert()
        .values({ userId: currentUserId, serviceId: id })
        .orIgnore()
        .execute();
    } else {
      await this.likeRepository.delete({ userId: currentUserId, serviceId: id });
    }

    return this.toResponse(material, currentUserId);
  }

  // ---------- вспомогательные методы ----------

  // услуга, которую может менять только создатель: нет — 404, чужая — 403
  private async findOwnMaterial(
    id: number,
    currentUserId: number,
  ): Promise<MasonryMaterialServiceEntity> {
    const material = await this.materialRepository.findOne({
      where: { id, status: Not<MasonryMaterialStatus>('deleted') },
    });
    if (!material) {
      throw new NotFoundException();
    }
    if (material.creatorId !== currentUserId) {
      throw new ForbiddenException(); // 403 — услуга другого пользователя
    }
    return material;
  }

  private findDraftEntity(userId: number): Promise<MasonryMaterialServiceEntity | null> {
    return this.materialRepository.findOne({ where: { creatorId: userId, status: 'draft' } });
  }

  private async toResponse(
    material: MasonryMaterialServiceEntity,
    currentUserId: number | null,
  ): Promise<MasonryMaterialResponse> {
    const [response] = await this.toResponses([material], currentUserId);
    return response;
  }

  // единый формат ответа: все поля всегда присутствуют, пустые — null
  private async toResponses(
    materials: MasonryMaterialServiceEntity[],
    currentUserId: number | null,
  ): Promise<MasonryMaterialResponse[]> {
    if (materials.length === 0) {
      return [];
    }
    const serviceIds = materials.map((material) => material.id);

    const [likesCountRows, currentUserLikes] = await Promise.all([
      this.likeRepository
        .createQueryBuilder('materialLike')
        .select('materialLike.serviceId', 'serviceId')
        .addSelect('COUNT(*)', 'likesCount')
        .where('materialLike.serviceId IN (:...serviceIds)', { serviceIds })
        .groupBy('materialLike.serviceId')
        .getRawMany<{ serviceId: number; likesCount: string }>(),
      // у гостя лайков нет
      currentUserId === null
        ? Promise.resolve([] as MasonryMaterialLikeEntity[])
        : this.likeRepository.find({
            select: { serviceId: true },
            where: { userId: currentUserId, serviceId: In(serviceIds) },
          }),
    ]);

    const likesCounts = new Map(likesCountRows.map((row) => [Number(row.serviceId), Number(row.likesCount)]));
    const likedServiceIds = new Set(currentUserLikes.map((like) => like.serviceId));

    return materials.map((material) => ({
      id: material.id,
      name: material.name,
      shortDescription: material.shortDescription ?? null,
      imageUrl: this.minioService.getPublicUrl(material.imageUrl),
      videoUrl: this.minioService.getPublicUrl(material.videoUrl),
      mortarPerM3: material.mortarPerM3 ?? null,
      consumptionPerM3: material.consumptionPerM3 ?? null,
      createdAt: material.createdAt,
      publishedAt: material.publishedAt ?? null,
      isMine: material.creatorId === currentUserId ? 1 : 0,
      likesCount: likesCounts.get(material.id) ?? 0,
      isLiked: likedServiceIds.has(material.id) ? 1 : 0,
    }));
  }
}
