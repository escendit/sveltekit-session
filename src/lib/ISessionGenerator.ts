export interface ISessionGenerator {
    generate(size: number): Buffer;
}