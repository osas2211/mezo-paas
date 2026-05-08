"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentStatus = exports.GitProvider = exports.Framework = void 0;
exports.Framework = {
    nextjs: 'nextjs',
    nestjs: 'nestjs',
    vite: 'vite',
    astro: 'astro',
    bun: 'bun',
    html: 'html',
    reactjs: 'reactjs',
    nuxtjs: 'nuxtjs',
    sveltejs: 'sveltejs',
    remix: 'remix',
    angular: 'angular',
    gatsby: 'gatsby',
    sveltekit: 'sveltekit',
    node: 'node'
};
exports.GitProvider = {
    github: 'github',
    gitlab: 'gitlab',
    bitbucket: 'bitbucket'
};
exports.DeploymentStatus = {
    PENDING_DEPLOYMENT: 'PENDING_DEPLOYMENT',
    QUEUED_FOR_BUILDING: 'QUEUED_FOR_BUILDING',
    BUILDING: 'BUILDING',
    READY: 'READY',
    ERROR: 'ERROR',
    CANCELED: 'CANCELED'
};
//# sourceMappingURL=enums.js.map