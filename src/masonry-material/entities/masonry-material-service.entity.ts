import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { MasonryMaterialUserEntity } from './masonry-material-user.entity';

export type MasonryMaterialStatus = 'draft' | 'published' | 'deleted';

@Entity('masonry_material_services')
export class MasonryMaterialServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'varchar', length: 16, default: 'draft' })
  status: MasonryMaterialStatus;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'video_url', type: 'varchar', length: 255, nullable: true })
  videoUrl: string | null;

  @Column({ name: 'mortar_per_m3', type: 'numeric', precision: 6, scale: 3, nullable: true })
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
