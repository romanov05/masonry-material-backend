import { MasonryMaterial } from './masonry-material.model';

export const masonryMaterialCollection: MasonryMaterial[] = [
  {
    id: 1,
    imageKey: 'walling-gas-block.jpg',
    videoKey: 'walling-gas-block.mp4',
    name: 'Газобетонный блок D500',
    description:
      'Лёгкий материал для возведения тёплых и энергоэффективных стен. Блоки D500 отличаются низкой теплопроводностью и точной геометрией, что снижает расход кладочного раствора и трудозатраты при кладке.',
    mortarPerM3: 0.02,
    consumptionPerM3: 28,
    status: 'draft',
    likedByUserIds: [],
  },
  {
    id: 2,
    imageKey: 'walling-ceramic-brick-m150.jpg',
    videoKey: 'walling-ceramic-brick-m150.mp4',
    name: 'Керамический кирпич М150',
    description:
      'Прочный материал для строительства жилых и хозяйственных зданий. Обладает хорошей морозостойкостью и подходит для несущих стен и фундаментов.',
    mortarPerM3: 0.232,
    consumptionPerM3: 394,
    status: 'published',
    likedByUserIds: [101, 102, 103],
  },
  {
    id: 3,
    imageKey: 'walling-silicate-brick-m150.jpg',
    videoKey: 'walling-silicate-brick-m150.mp4',
    name: 'Силикатный кирпич М150',
    description:
      'Экономичный материал на основе извести и песка. Применяется для кладки внутренних и наружных стен с последующей отделкой.',
    mortarPerM3: 0.234,
    consumptionPerM3: 394,
    status: 'published',
    likedByUserIds: [101, 104],
  },
  {
    id: 4,
    imageKey: 'walling-ceramic-block.jpg',
    videoKey: 'walling-ceramic-block.mp4',
    name: 'Керамический блок',
    description:
      'Крупноформатный поризованный блок для быстрого возведения тёплых стен с минимальным количеством швов и расходом раствора.',
    mortarPerM3: 0.045,
    consumptionPerM3: 200,
    status: 'published',
    likedByUserIds: [101, 102, 103, 105],
  },
  {
    id: 5,
    imageKey: 'walling-cinder-block.jpg',
    videoKey: 'walling-cinder-block.mp4',
    name: 'Шлакоблок',
    description:
      'Недорогой материал для возведения хозяйственных построек и заборов. Отличается высокой прочностью на сжатие.',
    mortarPerM3: 0.062,
    consumptionPerM3: 72,
    status: 'published',
    likedByUserIds: [101, 102, 103, 104, 106],
  },
  {
    id: 6,
    imageKey: 'walling-foam-block-d400.jpg',
    videoKey: 'walling-foam-block-d400.mp4',
    name: 'Пеноблок D400',
    description: 'Карточка в архиве: услуга удалена и не должна отображаться в интерфейсе.',
    mortarPerM3: 0.021,
    consumptionPerM3: 30,
    status: 'deleted',
    likedByUserIds: [101],
  },
];
