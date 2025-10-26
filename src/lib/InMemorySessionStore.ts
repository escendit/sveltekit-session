import type { ISessionStore } from '$lib/ISessionStore.js';

export class InMemorySessionStore implements ISessionStore {
    private readonly datastore: Record<string, Record<string, string | null>>;
    private readonly expirations: Record<string, number>;

    public constructor() {
        this.datastore = {};
        this.expirations = {};
    }
	exists(sessionKey: string): Promise<boolean> {

        // Validate input!
        if (sessionKey === undefined || sessionKey === null) {
            return Promise.reject(new Error(`Session key "${sessionKey}" is not valid.`));
        }

        // Does it exist?
        const result = Object.keys(this.datastore).find((a) => a === sessionKey);

        if (result === undefined) {
            return Promise.resolve(false);
        }

        const expires = Object.keys(this.expirations).find(a => a === sessionKey);

        if (expires === undefined) {
            return Promise.resolve(true);
        }

        if (new Date() > new Date(parseInt(expires))) {
            // we can also remove session keys if they're expired
            delete this.datastore[sessionKey];
            delete this.expirations[sessionKey];
            // report that session doesn't exist, since the current time is beyond expiration's time
            return Promise.resolve(false);
        }

        return Promise.resolve(true);
	}
	expire(sessionKey: string, seconds: number): Promise<number> {
        const date = new Date();
        const currentTime = date.getTime();

        this.expirations[sessionKey] = currentTime + seconds * 1000;
		return Promise.resolve(seconds);
	}
	getSingle(sessionKey: string): Promise<string | null> {
        const session = this.datastore[sessionKey]['default'];
        return Promise.resolve(session);
	}
	setSingle(sessionKey: string, value: string): Promise<string> {
        this.datastore[sessionKey]['default'] = value;
        return Promise.resolve('OK');
	}
	getMultiple(sessionKey: string, values: Array<string>): Promise<Array<string | null>> {
        const results: Array<string | null> = [];

        for (const key in values) {
            results.push(this.datastore[sessionKey][key]);
        }

        return Promise.resolve(results);
	}
	setMultiple(sessionKey: string, values: Array<string>): Promise<string> {

        if (values.length % 2 !== 0) {
            return Promise.reject("Invalid values count");
        }

        do {
            let key: string = values.shift()!;
            let value: string | null = values.shift()!;

            if (key === undefined || key === null) {
                return Promise.reject(`key "${key}" is required`);
            }

            if (this.datastore[sessionKey] === undefined || this.datastore[sessionKey] === null) {
                // fill
                this.datastore[sessionKey] = {};
            }

            this.datastore[sessionKey][key] = value;
        }
        while (values.length > 0);

        return Promise.resolve("OK");
	}
}
