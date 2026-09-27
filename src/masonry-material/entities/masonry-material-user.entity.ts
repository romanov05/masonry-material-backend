import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('masonry_material_users')
export class MasonryMaterialUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;
}
