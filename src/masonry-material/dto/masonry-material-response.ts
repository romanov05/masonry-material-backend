import { ApiProperty } from '@nestjs/swagger';

// ответ по услуге: всегда одинаковый набор полей, пустые — null
export class MasonryMaterialResponse {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: 'Клинкерный кирпич М400' })
  name: string;

  @ApiProperty({ type: String, nullable: true, example: 'Облицовочный клинкерный кирпич для наружных стен' })
  shortDescription: string | null;

  @ApiProperty({ example: 'http://localhost:9000/masonry-material-media/masonry-material-image-<uuid>.png' })
  imageUrl: string;

  @ApiProperty({ example: 'http://localhost:9000/masonry-material-media/masonry-material-video-<uuid>.mp4' })
  videoUrl: string;

  @ApiProperty({ type: Number, nullable: true, example: 0.23, description: 'Раствор на 1 м³ кладки, м³' })
  mortarPerM3: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 394, description: 'Расход, шт./м³' })
  consumptionPerM3: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  publishedAt: Date | null;

  @ApiProperty({ enum: [0, 1], description: '1 — создатель услуги совпадает с текущим пользователем' })
  isMine: 0 | 1;

  @ApiProperty({ example: 1 })
  likesCount: number;

  @ApiProperty({ enum: [0, 1], description: '1 — текущий пользователь поставил лайк' })
  isLiked: 0 | 1;
}
