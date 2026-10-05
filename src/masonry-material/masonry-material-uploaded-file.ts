export interface MasonryMaterialUploadedFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface MasonryMaterialUploadedFiles {
  image?: MasonryMaterialUploadedFile[];
  video?: MasonryMaterialUploadedFile[];
}
