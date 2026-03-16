import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { Test } from '@nestjs/testing';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Marketplace Endpoints', () => {
    let app: NestFastifyApplication;
    let authToken: string;
    let otherAuthToken: string;
    let listingId: string;
    const testWallet = '0x1234567890123456789012345678901234567890';
    const otherWallet = '0xABCDABCDABCDABCDABCDABCDABCDABCDABCDABCD';

    const validListing = {
        tokenId: '42',
        price: 100,
        name: 'Legendary Dragon #42',
        description: 'A rare cosmic dragon with diamond scales',
        isSecondary: false,
        traits: {
            background: 'cosmic',
            body: 'diamond',
            eyes: 'laser',
            mouth: 'diamond_grill',
            accessories: 'crown',
            special: 'lightning_aura',
        },
        rarity: {
            score: 95.5,
            rank: 'Legendary',
            breakdown: {
                background: 97,
                body: 98,
                eyes: 96,
                mouth: 99,
                accessories: 95,
                special: 97,
            },
        },
        imageUrl: 'ipfs://QmTestImage123',
        metadataUrl: 'ipfs://QmTestMeta456',
        gatewayUrl: 'https://gateway.pinata.cloud/ipfs/QmTestImage123',
        collectionAddress: '0xCollectionAddress1234567890ABCDEF12345678',
        chainId: 338,
    };

    async function getToken(wallet: string): Promise<string> {
        const nonceRes = await supertest(app.getHttpServer())
            .post('/auth/nonce')
            .send({ walletAddress: wallet });

        const verifyRes = await supertest(app.getHttpServer())
            .post('/auth/verify')
            .send({
                walletAddress: wallet,
                signature: 'test',
                nonce: nonceRes.body.nonce,
            });

        return verifyRes.body.token;
    }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter(),
        );
        app.useGlobalFilters(new HttpExceptionFilter());

        await app.init();
        await app.getHttpAdapter().getInstance().ready();

        authToken = await getToken(testWallet);
        otherAuthToken = await getToken(otherWallet);
    }, 30000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    // --- POST /market/list ---
    describe('POST /market/list', () => {
        it('returns 401 without auth', async () => {
            await supertest(app.getHttpServer())
                .post('/market/list')
                .send(validListing)
                .expect(401);
        });

        it('returns 400 with missing tokenId', async () => {
            const { tokenId: _, ...noTokenId } = validListing;
            await supertest(app.getHttpServer())
                .post('/market/list')
                .set('Authorization', `Bearer ${authToken}`)
                .send(noTokenId)
                .expect(400);
        });

        it('returns 400 with negative price', async () => {
            await supertest(app.getHttpServer())
                .post('/market/list')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ...validListing, price: -10 })
                .expect(400);
        });

        it('creates listing successfully', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/market/list')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validListing)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.listing).toBeDefined();
            expect(response.body.listing.tokenId).toBe(validListing.tokenId);
            expect(response.body.listing.price).toBe(validListing.price);
            expect(response.body.listing.seller).toBe(testWallet.toLowerCase());
            expect(response.body.listing.status).toBe('active');
            expect(response.body.listing.rarity.rank).toBe('Legendary');

            listingId = response.body.listing._id;
        });

        it('creates second listing for stats', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/market/list')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ...validListing, tokenId: '99', price: 50, name: 'Common NFT #99' })
                .expect(201);

            expect(response.body.success).toBe(true);
        });
    });

    // --- GET /market/listings ---
    describe('GET /market/listings', () => {
        it('lists active listings (public, no auth)', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/market/listings')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.listings.length).toBeGreaterThanOrEqual(2);
            expect(response.body.total).toBeGreaterThanOrEqual(2);
            expect(response.body.page).toBe(1);
            expect(response.body.limit).toBe(20);

            // Default filter is active
            for (const listing of response.body.listings) {
                expect(listing.status).toBe('active');
            }
        });

        it('pagination works', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/market/listings?page=1&limit=1')
                .expect(200);

            expect(response.body.listings).toHaveLength(1);
            expect(response.body.total).toBeGreaterThanOrEqual(2);
        });

        it('sort by price ascending', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/market/listings?sort=price_asc')
                .expect(200);

            if (response.body.listings.length >= 2) {
                expect(response.body.listings[0].price).toBeLessThanOrEqual(
                    response.body.listings[1].price,
                );
            }
        });

        it('sort by price descending', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/market/listings?sort=price_desc')
                .expect(200);

            if (response.body.listings.length >= 2) {
                expect(response.body.listings[0].price).toBeGreaterThanOrEqual(
                    response.body.listings[1].price,
                );
            }
        });

        it('filter by min price', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/market/listings?minPrice=75')
                .expect(200);

            for (const listing of response.body.listings) {
                expect(listing.price).toBeGreaterThanOrEqual(75);
            }
        });

        it('filter by max price', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/market/listings?maxPrice=60')
                .expect(200);

            for (const listing of response.body.listings) {
                expect(listing.price).toBeLessThanOrEqual(60);
            }
        });

        it('filter by rarity rank', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/market/listings?rarityRank=Legendary')
                .expect(200);

            for (const listing of response.body.listings) {
                expect(listing.rarity.rank).toBe('Legendary');
            }
        });

        it('search by name', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/market/listings?search=Dragon')
                .expect(200);

            expect(response.body.listings.length).toBeGreaterThanOrEqual(1);
            for (const listing of response.body.listings) {
                expect(listing.name.toLowerCase()).toContain('dragon');
            }
        });

        it('filter by seller wallet', async () => {
            const response = await supertest(app.getHttpServer())
                .get(`/market/listings?seller=${testWallet}`)
                .expect(200);

            for (const listing of response.body.listings) {
                expect(listing.seller).toBe(testWallet.toLowerCase());
            }
        });
    });

    // --- GET /market/listings/:id ---
    describe('GET /market/listings/:id', () => {
        it('returns listing by id', async () => {
            const response = await supertest(app.getHttpServer())
                .get(`/market/listings/${listingId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.listing.tokenId).toBe(validListing.tokenId);
            expect(response.body.listing.name).toBe(validListing.name);
        });

        it('returns 404 for non-existent listing', async () => {
            await supertest(app.getHttpServer())
                .get('/market/listings/67890abcdef1234567890abc')
                .expect(404);
        });
    });

    // --- GET /market/stats ---
    describe('GET /market/stats', () => {
        it('returns market stats', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/market/stats')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.stats).toBeDefined();
            expect(response.body.stats.totalListings).toBeGreaterThanOrEqual(2);
            expect(response.body.stats.activeListings).toBeGreaterThanOrEqual(2);
            expect(typeof response.body.stats.totalVolume).toBe('number');
            expect(response.body.stats.floorPrice).toBeGreaterThan(0);
            expect(response.body.stats.averagePrice).toBeGreaterThan(0);
        });
    });

    // --- DELETE /market/listings/:id ---
    describe('DELETE /market/listings/:id', () => {
        it('returns 401 without auth', async () => {
            await supertest(app.getHttpServer())
                .delete(`/market/listings/${listingId}`)
                .expect(401);
        });

        it('returns 403 for non-owner', async () => {
            await supertest(app.getHttpServer())
                .delete(`/market/listings/${listingId}`)
                .set('Authorization', `Bearer ${otherAuthToken}`)
                .expect(403);
        });

        it('returns 404 for non-existent listing', async () => {
            await supertest(app.getHttpServer())
                .delete('/market/listings/67890abcdef1234567890abc')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        it('cancels listing for owner', async () => {
            await supertest(app.getHttpServer())
                .delete(`/market/listings/${listingId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Verify cancelled
            const response = await supertest(app.getHttpServer())
                .get(`/market/listings/${listingId}`)
                .expect(200);

            expect(response.body.listing.status).toBe('cancelled');
        });

        it('returns 403 when trying to cancel already cancelled listing', async () => {
            await supertest(app.getHttpServer())
                .delete(`/market/listings/${listingId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(403);
        });
    });
});
