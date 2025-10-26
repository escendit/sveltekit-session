export interface ISessionStore {
    exists(sessionKey: string): Promise<boolean>;
    expire(sessionKey: string, seconds: number): Promise<number>;
    getSingle(sessionKey: string): Promise<string | null>;
    setSingle(sessionKey: string, value: string): Promise<string>;
    getMultiple(sessionKey: string, values: Array<string>): Promise<Array<string | null>>;
    setMultiple(sessionKey: string, values: Array<string>): Promise<string>;
}
