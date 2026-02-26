import { NestFastifyApplication } from '@nestjs/platform-fastify';
export declare function createTestApp(): Promise<NestFastifyApplication>;
export declare function closeTestApp(app: NestFastifyApplication): Promise<void>;
