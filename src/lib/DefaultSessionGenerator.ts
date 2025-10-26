import type { ISessionGenerator } from '$lib/ISessionGenerator.js';
import crypto from "node:crypto";

export class DefaultSessionGenerator implements ISessionGenerator {
    generate(size: number): Buffer {
        return crypto.randomBytes(size);
    }
}