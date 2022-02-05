import { Injectable } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import {GridFsStorage} from 'multer-gridfs-storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GridFsMulterConfigService implements MulterOptionsFactory {
    constructor(private configService:ConfigService) {}
    createMulterOptions(): MulterModuleOptions {
        const dbUrl = this.configService.get('DB_URL');
        const storage = new GridFsStorage({
            url: dbUrl,
            file: (req, file) => {
                // strip all spaces from file name
                const fileName = file.originalname.replace(/\s+/g, '');
                // create a new unique filename
                const __filename = `${Date.now()}-${fileName}`;
                return {
                    filename: __filename,
                    bucketName: 'adminProfilePictures',
                };
            },
        });
        
        return {
            storage,
        };
    }
}