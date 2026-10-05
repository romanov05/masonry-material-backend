import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('masonry_material_users')
export class MasonryMaterialUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 100, unique: true })
  fullName: string;

  // select: false — хеш пароля не попадает в обычные выборки
  @Column({ type: 'varchar', length: 100, select: false })
  password: string;
}
