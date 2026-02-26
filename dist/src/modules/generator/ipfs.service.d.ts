export declare class IpfsService {
    private readonly logger;
    private readonly pinata;
    private readonly gateway;
    constructor();
    uploadImage(buffer: Buffer, name: string): Promise<string>;
    uploadMetadata(metadata: Record<string, unknown>, name: string): Promise<string>;
    getGatewayUrl(ipfsUri: string): string;
}
