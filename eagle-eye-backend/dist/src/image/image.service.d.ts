import { Repository } from 'typeorm';
import { Images } from '../entities/images.entity';
export declare class ImageService {
    private readonly imagesRepository;
    constructor(imagesRepository: Repository<Images>);
    uploadImage(file: Express.Multer.File, logId?: number): Promise<{
        id: number;
        imageUrl: string;
        fileName: string;
        size: number;
        logId: number | null;
        createdAt: Date;
    }>;
    uploadMultipleImages(files: Express.Multer.File[], logId?: number): Promise<{
        message: string;
        images: ({
            id: number;
            imageUrl: string;
            fileName: string;
            size: number;
            logId: number | null;
            createdAt: Date;
        } | {
            fileName: string;
            error: string;
        })[];
    }>;
    private generateFileName;
    getImageById(imageId: number): Promise<{
        id: number;
        imageUrl: string;
        fileName: string;
        size: number;
        logId: number | null;
        createdAt: Date;
    }>;
    deleteImage(imageId: number): Promise<{
        message: string;
        deletedImage: {
            id: number;
            fileName: string;
            imageUrl: string;
        };
    }>;
    updateImage(imageId: number, updateData: {
        fileName?: string;
        logId?: number;
    }, newFile?: Express.Multer.File): Promise<{
        message: string;
        image: {
            imageUrl: string;
            fileName: string;
            size: number;
            logId: number | null;
            createdAt: Date;
        };
    }>;
}
