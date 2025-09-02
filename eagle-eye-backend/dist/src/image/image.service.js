"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_s3_1 = require("@aws-sdk/client-s3");
const images_entity_1 = require("../entities/images.entity");
const s3_config_1 = require("./s3.config");
let ImageService = class ImageService {
    imagesRepository;
    constructor(imagesRepository) {
        this.imagesRepository = imagesRepository;
    }
    async uploadImage(file, logId) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (file.size > s3_config_1.S3_CONFIG.MAX_FILE_SIZE) {
            throw new common_1.BadRequestException('File size exceeds maximum limit');
        }
        if (!s3_config_1.S3_CONFIG.ALLOWED_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type');
        }
        try {
            const fileName = this.generateFileName(file.originalname);
            const key = `${s3_config_1.S3_CONFIG.FOLDER}${fileName}`;
            const uploadCommand = new client_s3_1.PutObjectCommand({
                Bucket: s3_config_1.S3_CONFIG.BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read',
            });
            await s3_config_1.s3Client.send(uploadCommand);
            const imageUrl = `https://${s3_config_1.S3_CONFIG.BUCKET_NAME}.${s3_config_1.S3_CONFIG.REGION}.digitaloceanspaces.com/${key}`;
            const fileSizeInMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));
            const image = this.imagesRepository.create({
                imageUrl,
                fileName: file.originalname,
                size: fileSizeInMB,
                log: logId ? { id: logId } : undefined,
            });
            const savedImage = await this.imagesRepository.save(image);
            return {
                id: savedImage.id,
                imageUrl: savedImage.imageUrl,
                fileName: savedImage.fileName,
                size: savedImage.size,
                logId: logId || null,
                createdAt: savedImage.createdAt,
            };
        }
        catch (error) {
            console.error('Image upload failed:', error);
            throw new common_1.BadRequestException('Failed to upload image');
        }
    }
    async uploadMultipleImages(files, logId) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        if (files.length > 10) {
            throw new common_1.BadRequestException('Maximum 10 files allowed per upload');
        }
        const uploadPromises = files.map(async (file) => {
            try {
                const uploadedImage = await this.uploadImage(file, logId);
                return uploadedImage;
            }
            catch (error) {
                console.error(`Failed to upload file ${file.originalname}:`, error);
                return {
                    fileName: file.originalname,
                    error: 'Failed to upload this file',
                };
            }
        });
        const uploadedImages = await Promise.all(uploadPromises);
        return {
            message: `Uploaded ${uploadedImages.filter((img) => !img.error).length} out of ${files.length} images`,
            images: uploadedImages,
        };
    }
    generateFileName(originalName) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = originalName.split('.').pop();
        return `${timestamp}-${randomString}.${extension}`;
    }
    async getImageById(imageId) {
        const image = await this.imagesRepository.findOne({
            where: { id: imageId },
            relations: ['log']
        });
        if (!image) {
            throw new common_1.NotFoundException('Image not found');
        }
        return {
            id: image.id,
            imageUrl: image.imageUrl,
            fileName: image.fileName,
            size: image.size,
            logId: image.log?.id || null,
            createdAt: image.createdAt,
        };
    }
    async deleteImage(imageId) {
        const image = await this.imagesRepository.findOne({ where: { id: imageId } });
        if (!image) {
            throw new common_1.NotFoundException('Image not found');
        }
        try {
            const imageUrl = image.imageUrl;
            const key = imageUrl.replace(`https://${s3_config_1.S3_CONFIG.BUCKET_NAME}.${s3_config_1.S3_CONFIG.REGION}.digitaloceanspaces.com/${s3_config_1.S3_CONFIG.FOLDER}`, '');
            const deleteCommand = new client_s3_1.DeleteObjectCommand({
                Bucket: s3_config_1.S3_CONFIG.BUCKET_NAME,
                Key: `${s3_config_1.S3_CONFIG.FOLDER}${key}`,
            });
            await s3_config_1.s3Client.send(deleteCommand);
            await this.imagesRepository.remove(image);
            return {
                message: 'Image deleted successfully',
                deletedImage: {
                    id: image.id,
                    fileName: image.fileName,
                    imageUrl: image.imageUrl,
                }
            };
        }
        catch (error) {
            console.error('Image deletion failed:', error);
            throw new common_1.BadRequestException('Failed to delete image');
        }
    }
    async updateImage(imageId, updateData, newFile) {
        const image = await this.imagesRepository.findOne({
            where: { id: imageId },
            relations: ['log']
        });
        if (!image) {
            throw new common_1.NotFoundException('Image not found');
        }
        try {
            if (newFile) {
                if (newFile.size > s3_config_1.S3_CONFIG.MAX_FILE_SIZE) {
                    throw new common_1.BadRequestException('File size exceeds maximum limit');
                }
                if (!s3_config_1.S3_CONFIG.ALLOWED_TYPES.includes(newFile.mimetype)) {
                    throw new common_1.BadRequestException('Invalid file type');
                }
                const existingImageUrl = image.imageUrl;
                const existingKey = existingImageUrl.replace(`https://${s3_config_1.S3_CONFIG.BUCKET_NAME}.${s3_config_1.S3_CONFIG.REGION}.digitaloceanspaces.com/${s3_config_1.S3_CONFIG.FOLDER}`, '');
                const deleteCommand = new client_s3_1.DeleteObjectCommand({
                    Bucket: s3_config_1.S3_CONFIG.BUCKET_NAME,
                    Key: `${s3_config_1.S3_CONFIG.FOLDER}${existingKey}`,
                });
                await s3_config_1.s3Client.send(deleteCommand);
                const newFileName = this.generateFileName(newFile.originalname);
                const newKey = `${s3_config_1.S3_CONFIG.FOLDER}${newFileName}`;
                const uploadCommand = new client_s3_1.PutObjectCommand({
                    Bucket: s3_config_1.S3_CONFIG.BUCKET_NAME,
                    Key: newKey,
                    Body: newFile.buffer,
                    ContentType: newFile.mimetype,
                    ACL: 'public-read',
                });
                await s3_config_1.s3Client.send(uploadCommand);
                image.imageUrl = `https://${s3_config_1.S3_CONFIG.BUCKET_NAME}.${s3_config_1.S3_CONFIG.REGION}.digitaloceanspaces.com/${newKey}`;
                image.fileName = newFile.originalname;
                image.size = parseFloat((newFile.size / (1024 * 1024)).toFixed(2));
            }
            if (updateData.fileName !== undefined && !newFile) {
                image.fileName = updateData.fileName;
            }
            if (updateData.logId !== undefined) {
                if (updateData.logId) {
                    image.log = { id: updateData.logId };
                }
                else {
                    image.log = null;
                }
            }
            const updatedImage = await this.imagesRepository.save(image);
            return {
                message: 'Image updated successfully',
                image: {
                    imageUrl: updatedImage.imageUrl,
                    fileName: updatedImage.fileName,
                    size: updatedImage.size,
                    logId: updatedImage.log?.id || null,
                    createdAt: updatedImage.createdAt,
                }
            };
        }
        catch (error) {
            console.error('Image update failed:', error);
            throw new common_1.BadRequestException('Failed to update image');
        }
    }
};
exports.ImageService = ImageService;
exports.ImageService = ImageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(images_entity_1.Images)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ImageService);
//# sourceMappingURL=image.service.js.map