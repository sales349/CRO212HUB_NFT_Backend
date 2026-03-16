import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Listing, ListingDocument } from './schemas/listing.schema';
import { CreateListingDto, ListListingsQueryDto } from './dto/marketplace.dto';

@Injectable()
export class MarketplaceService {
    private readonly logger = new Logger(MarketplaceService.name);

    constructor(
        @InjectModel(Listing.name) private readonly listingModel: Model<ListingDocument>,
    ) { }

    async createListing(dto: CreateListingDto, seller: string): Promise<ListingDocument> {
        this.logger.log(`Creating listing for token ${dto.tokenId} by ${seller}`);

        const listing = new this.listingModel({
            ...dto,
            seller: seller.toLowerCase(),
            status: 'active',
        });

        const saved = await listing.save();
        this.logger.log(`Listing created: ${saved._id}`);
        return saved;
    }

    async getListings(query: ListListingsQueryDto): Promise<{
        listings: ListingDocument[];
        total: number;
        page: number;
        limit: number;
    }> {
        const { page, limit, sort, status, minPrice, maxPrice, rarityRank, seller, collectionAddress, search } = query;
        const skip = (page - 1) * limit;

        const filter: FilterQuery<ListingDocument> = {};

        // Status filter
        if (status !== 'all') {
            filter.status = status;
        }

        // Price range
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined) filter.price.$gte = minPrice;
            if (maxPrice !== undefined) filter.price.$lte = maxPrice;
        }

        // Rarity rank filter
        if (rarityRank) {
            filter['rarity.rank'] = rarityRank;
        }

        // Seller filter
        if (seller) {
            filter.seller = seller.toLowerCase();
        }

        // Collection filter
        if (collectionAddress) {
            filter.collectionAddress = collectionAddress;
        }

        // Search by name
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        // Sort options
        let sortOption: Record<string, 1 | -1>;
        switch (sort) {
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'rarity':
                sortOption = { 'rarity.score': -1 };
                break;
            case 'newest':
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        const [listings, total] = await Promise.all([
            this.listingModel.find(filter).sort(sortOption).skip(skip).limit(limit).exec(),
            this.listingModel.countDocuments(filter).exec(),
        ]);

        return { listings, total, page, limit };
    }

    async getListing(listingId: string): Promise<ListingDocument> {
        const listing = await this.listingModel.findById(listingId).exec();
        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        // Increment view count (non-blocking)
        this.listingModel.findByIdAndUpdate(listingId, { $inc: { viewCount: 1 } }).exec().catch(() => { });

        return listing;
    }

    async cancelListing(listingId: string, walletAddress: string): Promise<void> {
        const listing = await this.listingModel.findById(listingId).exec();

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        if (listing.seller !== walletAddress.toLowerCase()) {
            throw new ForbiddenException('You can only cancel your own listings');
        }

        if (listing.status !== 'active') {
            throw new ForbiddenException('Only active listings can be cancelled');
        }

        listing.status = 'cancelled';
        listing.cancelledAt = new Date();
        await listing.save();

        this.logger.log(`Listing cancelled: ${listingId}`);
    }

    async getMarketStats(): Promise<{
        totalListings: number;
        activeListings: number;
        totalVolume: number;
        floorPrice: number | null;
        averagePrice: number | null;
    }> {
        const [totalListings, activeListings, volumeAgg, floorAgg] = await Promise.all([
            this.listingModel.countDocuments({}).exec(),
            this.listingModel.countDocuments({ status: 'active' }).exec(),
            this.listingModel.aggregate([
                { $match: { status: 'sold' } },
                { $group: { _id: null, total: { $sum: '$price' } } },
            ]).exec(),
            this.listingModel.aggregate([
                { $match: { status: 'active' } },
                {
                    $group: {
                        _id: null,
                        floor: { $min: '$price' },
                        avg: { $avg: '$price' },
                    },
                },
            ]).exec(),
        ]);

        return {
            totalListings,
            activeListings,
            totalVolume: volumeAgg[0]?.total ?? 0,
            floorPrice: floorAgg[0]?.floor ?? null,
            averagePrice: floorAgg[0]?.avg ? Math.round(floorAgg[0].avg * 100) / 100 : null,
        };
    }
}
