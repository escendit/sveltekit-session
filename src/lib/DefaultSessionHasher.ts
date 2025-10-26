import type { ISessionHasher } from '$lib/ISessionHasher.js';
import {binary_to_base58} from "base58-js";

export class DefaultSessionHasher implements ISessionHasher {
    hash(buffer: Buffer): string {
        return binary_to_base58(buffer);
    }
}