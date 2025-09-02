import { ImageService } from './image.service';
import { UploadImageDto } from './imageDto/upload-image.dto';
import { UpdateImageDto } from './imageDto/update-image.dto';
export declare class ImageController {
    private readonly imageService;
    constructor(imageService: ImageService);
    uploadImages(files: Express.Multer.File[], uploadData: UploadImageDto): Promise<{
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
    getImage(id: number): Promise<{
        id: number;
        imageUrl: string;
        fileName: string;
        size: number;
        logId: number | null;
        createdAt: Date;
    }>;
    deleteImage(id: number): Promise<{
        message: string;
        deletedImage: {
            id: number;
            fileName: string;
            imageUrl: string;
        };
    }>;
    updateImage(id: number, file: Express.Multer.File, updateData: UpdateImageDto): Promise<{
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
