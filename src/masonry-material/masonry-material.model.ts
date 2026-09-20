export type MasonryMaterialStatus = 'draft' | 'published' | 'deleted';

export interface MasonryMaterial {
  id: number;
  imageKey: string;
  videoKey: string;
  name: string;
  description: string;
  mortarPerM3: number;
  consumptionPerM3: number;
  status: MasonryMaterialStatus;
  likedByUserIds: number[];
}
