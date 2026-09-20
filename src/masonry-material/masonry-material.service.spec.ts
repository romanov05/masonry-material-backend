import { Test, TestingModule } from '@nestjs/testing';
import { MasonryMaterialService } from './masonry-material.service.js';

describe('MasonryMaterialService', () => {
  let service: MasonryMaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MasonryMaterialService],
    }).compile();

    service = module.get<MasonryMaterialService>(MasonryMaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
