import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class CompositingService {
    private readonly logger = new Logger(CompositingService.name);
    private cachedPlaceholder: Buffer | null = null;

    async compositeImage(_traits: Record<string, string>): Promise<Buffer> {
        if (this.cachedPlaceholder) {
            return this.cachedPlaceholder;
        }

        this.logger.log('Generating placeholder image (awaiting client trait assets)');

        const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="100%" stop-color="#a855f7"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bg)"/>
      <text x="256" y="230" font-size="48" fill="white" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold">CRO212HUB</text>
      <text x="256" y="280" font-size="20" fill="rgba(255,255,255,0.7)" text-anchor="middle" font-family="Arial, sans-serif">Genesis Collection</text>
      <text x="256" y="320" font-size="14" fill="rgba(255,255,255,0.4)" text-anchor="middle" font-family="Arial, sans-serif">Placeholder</text>
    </svg>`;

        const buffer = await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer();
        this.cachedPlaceholder = buffer;
        return buffer;
    }
}