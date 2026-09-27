import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MasonryMaterialUserEntity } from './masonry-material-user.entity';
import { MasonryMaterialServiceEntity } from './masonry-material-service.entity';

@Entity('masonry_material_likes')
export class MasonryMaterialLikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'service_id' })
  serviceId: number;

  @ManyToOne(() => MasonryMaterialUserEntity)
  @JoinColumn({ name: 'user_id' })
  user: MasonryMaterialUserEntity;

  @ManyToOne(() => MasonryMaterialServiceEntity)
  @JoinColumn({ name: 'service_id' })
  service: MasonryMaterialServiceEntity;
}
