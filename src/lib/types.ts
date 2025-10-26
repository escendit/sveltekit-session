import type { RequestEvent, ResolveOptions } from '@sveltejs/kit/src/exports/public.js';
import type { MaybePromise } from '@sveltejs/kit/src/types/private.js';
import type { ISessionStore } from '$lib/ISessionStore.js';
import type { ISessionHasher } from '$lib/ISessionHasher.js';
import type { ISessionGenerator } from '$lib/ISessionGenerator.js';

type SessionConfig = {
	cookie?: string;
	expireIn?: number;
    size?: number;
    sessionStore?: ISessionStore;
    sessionHasher?: ISessionHasher;
    sessionGenerator?: ISessionGenerator;
}

type InternalSessionConfig = {
    cookie: string;
    expireIn: number;
    size: number;
    sessionStore: ISessionStore;
    sessionHasher: ISessionHasher;
    sessionGenerator: ISessionGenerator;
}

type InternalMiddlewareHandle = (input: {
	event: RequestEvent;
	resolve: (event: RequestEvent, opts?: ResolveOptions) => MaybePromise<Response>;
}, options: InternalSessionConfig) => MaybePromise<Response>;

export {
    type SessionConfig,
	type InternalMiddlewareHandle,
    type InternalSessionConfig
}
