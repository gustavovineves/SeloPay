import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const disputeMulterOptions = {
  storage: diskStorage({
    destination: join(__dirname, '..', '..', '..', '..', 'uploads', 'disputes'),
    filename: (_req, file, cb) => {
      const unique = crypto.randomUUID();
      const ext = extname(file.originalname).toLowerCase() || '.bin';
      cb(null, `${unique}${ext}`);
    },
  }),
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
};
