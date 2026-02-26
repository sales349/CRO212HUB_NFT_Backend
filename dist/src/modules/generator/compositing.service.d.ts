export declare class CompositingService {
    private readonly logger;
    private cachedPlaceholder;
    compositeImage(_traits: Record<string, string>): Promise<Buffer>;
}
