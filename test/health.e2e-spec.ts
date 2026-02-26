import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp, closeTestApp } from './setup';

describe('Health Endpoints', () => {
    let app: NestFastifyApplication;

    beforeAll(async () => {
        app = await createTestApp();
    }, 30000);

    afterAll(async () => {
        await closeTestApp(app);
    });

    describe('GET /health', () => {
        it('returns ok status', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('ok');
            expect(response.body.timestamp).toBeDefined();
            expect(response.body.uptime).toBeGreaterThan(0);
        });
    });

    describe('GET /health/ready', () => {
        it('returns ready status with service checks', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/health/ready')
                .expect(200);

            expect(response.body.status).toBeDefined();
            expect(response.body.checks).toBeDefined();
            expect(response.body.checks.mongodb).toBe('connected');
            expect(response.body.checks.redis).toBe('connected');
        });
    });
});