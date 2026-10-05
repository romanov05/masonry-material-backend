import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { MasonryMaterialUserEntity } from './masonry-material-user.entity';

export type MasonryMaterialStatus = 'draft' | 'published' | 'deleted';

// pg возвращает NUMERIC строкой — переводим в число
const masonryMaterialNumericTransformer: ValueTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('masonry_material_services')
export class MasonryMaterialServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, unique: true })
  name: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'varchar', length: 16, default: 'draft' })
  status: MasonryMaterialStatus;

  // имя файла изображения в MinIO (у записей 2-й лабораторной — полная ссылка)
  @Column({ name: 'image_url', type: 'varchar', length: 255 })
  imageUrl: string;

  // имя файла видео в MinIO (у записей 2-й лабораторной — полная ссылка)
  @Column({ name: 'video_url', type: 'varchar', length: 255 })
  videoUrl: string;

  @Column({
    name: 'mortar_per_m3',
    type: 'numeric',
    precision: 6,
    scale: 3,
    nullable: true,
    transformer: masonryMaterialNumericTransformer,
  })
  mortarPerM3: number | null;

  @Column({ name: 'consumption_per_m3', type: 'integer', nullable: true })
  consumptionPerM3: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ name: 'creator_id' })
  creatorId: number;

  @ManyToOne(() => MasonryMaterialUserEntity)
  @JoinColumn({ name: 'creator_id' })
  creator: MasonryMaterialUserEntity;
}
