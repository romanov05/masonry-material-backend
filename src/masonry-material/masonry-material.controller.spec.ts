import { Test, TestingModule } from '@nestjs/testing';
import { MasonryMaterialController } from './masonry-material.controller.js';

describe('MasonryMaterialController', () => {
  let controller: MasonryMaterialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasonryMaterialController],
    }).compile();

    controller = module.get<MasonryMaterialController>(MasonryMaterialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
