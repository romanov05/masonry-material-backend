export interface MasonryMaterialResponse {
  id: number;
  name: string;
  shortDescription: string | null;
  imageUrl: string;
  videoUrl: string;
  mortarPerM3: number | null;
  consumptionPerM3: number | null;
  createdAt: Date;
  publishedAt: Date | null;
  isMine: 0 | 1;   // 1 — создатель услуги совпадает с текущим пользователем
  likesCount: number;
  isLiked: 0 | 1;  // 1 — текущий пользователь поставил лайк
}
