import { Injectable, NotFoundException } from '@nestjs/common';
import { masonryMaterialCollection } from './masonry-material.data';
import { MasonryMaterial } from './masonry-material.model';

@Injectable()
export class MasonryMaterialService {
  private readonly collection: MasonryMaterial[] = masonryMaterialCollection;

  private getVisible(): MasonryMaterial[] {
    return this.collection.filter((item) => item.status !== 'deleted');
  }

  private getPublished(): MasonryMaterial[] {
    return this.getVisible().filter((item) => item.status === 'published');
  }

  getLikesCount(item: MasonryMaterial): number {
    return item.likedByUserIds.length;
  }

  getDraft(): MasonryMaterial {
    const draft = this.collection.find((item) => item.status === 'draft');
    if (!draft) {
      throw new NotFoundException('Черновик не найден');
    }
    return draft;
  }

  getPublishedList(maxConsumption?: string): MasonryMaterial[] {
    const published = this.getPublished();
    if (!maxConsumption) {
      return published;
    }
    const limit = Number(maxConsumption);
    if (Number.isNaN(limit)) {
      return published;
    }
    return published.filter((item) => item.consumptionPerM3 <= limit);
  }

  getFeedItem(id?: number, next = false): MasonryMaterial {
    const published = this.getPublished();
    if (published.length === 0) {
      throw new NotFoundException('Нет опубликованных услуг');
    }

    if (id === undefined) {
      return published[0];
    }

    const currentIndex = published.findIndex((item) => item.id === id);
    if (currentIndex === -1) {
      throw new NotFoundException(`Услуга с id=${id} не найдена среди опубликованных`);
    }

    if (next) {
      const nextIndex = (currentIndex + 1) % published.length;
      return published[nextIndex];
    }

    return published[currentIndex];
  }
}
