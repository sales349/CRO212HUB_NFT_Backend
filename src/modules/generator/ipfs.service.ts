import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PinataSDK } from 'pinata';
import { appConfig } from '../../config/app.config';

@Injectable()
export class IpfsService {
    private readonly logger = new Logger(IpfsService.name);
    private readonly pinata: PinataSDK;
    private readonly gateway: string;

    constructor() {
        this.pinata = new PinataSDK({
            pinataJwt: appConfig.PINATA_JWT,
            pinataGateway: appConfig.PINATA_GATEWAY,
        });
        this.gateway = appConfig.PINATA_GATEWAY;
    }

    async uploadImage(buffer: Buffer, name: string): Promise<string> {
        try {
            const file = new File([buffer], `${name}.png`, { type: 'image/png' });
            const result = await this.pinata.upload.public.file(file).name(`${name}-image`);
            this.logger.log(`Image uploaded to IPFS: ${result.cid}`);
            return `ipfs://${result.cid}`;
        } catch (error) {
            this.logger.error('Failed to upload image to IPFS', error instanceof Error ? error.stack : error);
            throw new InternalServerErrorException('Image upload failed');
        }
    }

    async uploadMetadata(metadata: Record<string, unknown>, name: string): Promise<string> {
        try {
            const result = await this.pinata.upload.public.json(metadata).name(`${name}-metadata`);
            this.logger.log(`Metadata uploaded to IPFS: ${result.cid}`);
            return `ipfs://${result.cid}`;
        } catch (error) {
            this.logger.error('Failed to upload metadata to IPFS', error instanceof Error ? error.stack : error);
            throw new InternalServerErrorException('Metadata upload failed');
        }
    }

    getGatewayUrl(ipfsUri: string): string {
        const cid = ipfsUri.replace('ipfs://', '');
        return `https://${this.gateway}/ipfs/${cid}`;
    }
}