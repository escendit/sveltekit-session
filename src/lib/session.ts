import { redirect, type Handle } from '@sveltejs/kit';
import type { InternalMiddlewareHandle, InternalSessionConfig, SessionConfig } from '$lib/types.js';
import { Defaults } from '$lib/config.js';
import type { ISessionStore } from '$lib/ISessionStore.js';
import type { ISessionHasher } from '$lib/ISessionHasher.js';
import type { ISessionGenerator } from '$lib/ISessionGenerator.js';

const SessionMiddleware = (sessionConfig?: SessionConfig) => {

    const configuredSessionConfig: InternalSessionConfig = {
        ...Defaults,
        ...sessionConfig
    };

    const errors = ValidateSessionConfiguration(configuredSessionConfig);

    if (errors.length > 0) {
        console.error(errors);
        throw new Error('Invalid session config');
    }

    const handleSessionMiddleware: Handle = async (request) => {
        return handleSessionMiddlewareInternal(request, {
            ...Defaults,
            ...sessionConfig
        });
    };
    return handleSessionMiddleware;
};

const handleSessionMiddlewareInternal: InternalMiddlewareHandle = async ({ event, resolve }, options) => {

    const store: ISessionStore = options.sessionStore;
    const hasher: ISessionHasher = options.sessionHasher
    const generator: ISessionGenerator = options.sessionGenerator;

    // Skip favicon requests
    if (event.url.pathname === '/favicon.ico') {
        return resolve(event);
    }

    const cookieName = options.cookie;
    const expiresIn = options.expireIn;

    let cookieValue = event.cookies.get(cookieName);

    if (cookieValue !== undefined) {
        const sessionKey = `session:${cookieValue}`;

        if (await store.exists(sessionKey)) {

            const [identity, created] = await store.getMultiple(sessionKey, [
                'identity',
                'created',
            ]);

            // populate session id & identity
            event.locals.sessionId = cookieValue;
            event.locals.session = {
                identity: identity ? JSON.parse(identity) : null,
                created
            };
            return resolve(event);
        }
    }

    const sessionId = hasher.hash(generator.generate(options.size));
    const sessionKey = `session:${sessionId}`;

    await store.setMultiple(sessionKey, [
        'identity',
        JSON.stringify(null),
        'created',
        Date.now().toString()
    ])

    await store.expire(sessionKey, expiresIn);


    const currentDate = new Date();
    const expiredDate = new Date(currentDate.getTime() + (options.expireIn * 1000));
    event.setHeaders({
        'Cache-Control': 'no-store'
    });

    event.cookies.set(cookieName, sessionId, {
        expires: expiredDate,
        path: '/',
        secure: true,
        sameSite: 'strict',
        httpOnly: true,
        partitioned: true,
        priority: 'high'
    });

    // we have to redirect to write a cookie
    // we avoid issues with non-existing cookies in after middleware...
    return redirect(307, event.url);
};

const ValidateSessionConfiguration = (configuration: InternalSessionConfig): Array<string> => {

    const errors: Array<string> = [];

    if (!configuration.cookie) {
        errors.push("Cookie is missing");
    }

    if (isNaN(configuration.expireIn)) {
        errors.push("Expire In is not a number");
    }

    if (!configuration.sessionGenerator) {
        errors.push("Session generator is missing");
    }

    if (!configuration.sessionHasher) {
        errors.push("Session hasher is missing");
    }

    if (!configuration.sessionStore) {
        errors.push("Session store is missing");
    }

    return errors;
};

export {
    SessionMiddleware
};