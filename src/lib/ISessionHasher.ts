
export interface ISessionHasher {
    hash(buffer: Buffer): string;
}