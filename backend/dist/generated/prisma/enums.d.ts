export declare const Framework: {
    readonly nextjs: "nextjs";
    readonly nestjs: "nestjs";
    readonly vite: "vite";
    readonly astro: "astro";
    readonly bun: "bun";
    readonly html: "html";
    readonly reactjs: "reactjs";
    readonly nuxtjs: "nuxtjs";
    readonly sveltejs: "sveltejs";
    readonly remix: "remix";
    readonly angular: "angular";
    readonly gatsby: "gatsby";
    readonly sveltekit: "sveltekit";
    readonly node: "node";
};
export type Framework = (typeof Framework)[keyof typeof Framework];
export declare const GitProvider: {
    readonly github: "github";
    readonly gitlab: "gitlab";
    readonly bitbucket: "bitbucket";
};
export type GitProvider = (typeof GitProvider)[keyof typeof GitProvider];
export declare const DeploymentStatus: {
    readonly PENDING_DEPLOYMENT: "PENDING_DEPLOYMENT";
    readonly QUEUED_FOR_BUILDING: "QUEUED_FOR_BUILDING";
    readonly BUILDING: "BUILDING";
    readonly READY: "READY";
    readonly ERROR: "ERROR";
    readonly CANCELED: "CANCELED";
};
export type DeploymentStatus = (typeof DeploymentStatus)[keyof typeof DeploymentStatus];
