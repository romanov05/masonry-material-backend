const MASONRY_MATERIAL_FIXED_USER_ID = 2;

export class MasonryMaterialCurrentUser {
  private static instance: MasonryMaterialCurrentUser | null = null;

  private constructor(public readonly id: number) {}

  static getInstance(): MasonryMaterialCurrentUser {
    if (!MasonryMaterialCurrentUser.instance) {
      MasonryMaterialCurrentUser.instance = new MasonryMaterialCurrentUser(MASONRY_MATERIAL_FIXED_USER_ID);
    }
    return MasonryMaterialCurrentUser.instance;
  }
}

export function getMasonryMaterialCurrentUserId(): number {
  return MasonryMaterialCurrentUser.getInstance().id;
}
