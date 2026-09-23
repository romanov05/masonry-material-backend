import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { MasonryMaterialServiceEntity } from './entities/masonry-material-service.entity';
import { MasonryMaterialLikeEntity } from './entities/masonry-material-like.entity';

@Injectable()
export class MasonryMaterialService {
  constructor(
    @InjectRepository(MasonryMaterialServiceEntity)
    private readonly materialRepository: Repository<MasonryMaterialServiceEntity>,
    @InjectRepository(MasonryMaterialLikeEntity)
    private readonly likeRepository: Repository<MasonryMaterialLikeEntity>,
  ) {}

  async getLikesCount(serviceId: number): Promise<number> {
    return this.likeRepository.count({ where: { serviceId } });
  }

  /** ORM, одна строка: черновик текущего пользователя (или null, если его нет) */
  async findDraftByUser(userId: number): Promise<MasonryMaterialServiceEntity | null> {
    return this.materialRepository.findOne({ where: { creatorId: userId, status: 'draft' } });
  }

  /** ORM: создание черновика — только если у пользователя его ещё нет ("Далее") */
  async createDraftIfMissing(userId: number, name: string): Promise<void> {
    const existing = await this.findDraftByUser(userId);
    if (existing) {
      return;
    }
    const draft = this.materialRepository.create({
      name: name?.trim() || 'Новая услуга',
      status: 'draft',
      creatorId: userId,
    });
    await this.materialRepository.save(draft);
  }

  /** ORM: публикация черновика ("Опубликовать") — смена статуса + заполнение полей */
  async publish(
    id: number,
    userId: number,
    fields: { shortDescription: string; mortarPerM3: number; consumptionPerM3: number },
  ): Promise<void> {
    await this.materialRepository.update(
      { id, creatorId: userId, status: 'draft' },
      {
        status: 'published',
        shortDescription: fields.shortDescription,
        mortarPerM3: fields.mortarPerM3,
        consumptionPerM3: fields.consumptionPerM3,
        publishedAt: new Date(),
      },
    );
  }

  /** ORM: список опубликованных услуг с фильтром "расход не более X" */
  async getPublishedList(maxConsumption?: string): Promise<MasonryMaterialServiceEntity[]> {
    const limit = maxConsumption ? Number(maxConsumption) : NaN;
    if (Number.isNaN(limit)) {
      return this.materialRepository.find({ where: { status: 'published' }, order: { id: 'ASC' } });
    }
    return this.materialRepository.find({
      where: { status: 'published', consumptionPerM3: LessThanOrEqual(limit) },
      order: { id: 'ASC' },
    });
  }

  /** ORM, лента — каждая ветка забирает из БД РОВНО одну строку */
  async getFeedItem(id?: number, next = false): Promise<MasonryMaterialServiceEntity> {
    if (id === undefined) {
      const first = await this.materialRepository.findOne({
        where: { status: 'published' },
        order: { id: 'ASC' },
      });
      if (!first) {
        throw new NotFoundException('Нет опубликованных услуг');
      }
      return first;
    }

    if (next) {
      const nextItem = await this.materialRepository.findOne({
        where: { status: 'published', id: MoreThan(id) },
        order: { id: 'ASC' },
      });
      if (nextItem) {
        return nextItem;
      }
      const first = await this.materialRepository.findOne({
        where: { status: 'published' },
        order: { id: 'ASC' },
      });
      if (!first) {
        throw new NotFoundException('Нет опубликованных услуг');
      }
      return first;
    }

    const item = await this.materialRepository.findOne({ where: { id, status: 'published' } });
    if (!item) {
      throw new NotFoundException(`Услуга с id=${id} не найдена среди опубликованных`);
    }
    return item;
  }

  /** Логическое удаление: чистый SQL UPDATE через курсор */
  async softDeleteViaRawSql(id: number): Promise<void> {
    await this.materialRepository.query(
      `UPDATE masonry_material_services SET status = 'deleted' WHERE id = $1`,
      [id],
    );
  }
}
