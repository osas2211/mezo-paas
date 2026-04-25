"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env_config = void 0;
exports.env_config = {
    get port() {
        return process.env.PORT;
    },
    get mezoRpcUrl() {
        return process.env.MEZO_RPC_URL;
    },
    get mezoWssRpcUrl() {
        return process.env.MEZO_WSS_RPC_URL;
    },
    get mezoChainId() {
        return process.env.MEZO_CHAIN_ID;
    },
    get mezoDecimal() {
        return process.env.MEZO_DECIMAL;
    },
    get mezoExplorer() {
        return process.env.MEZO_EXPLORER;
    },
    get encryption_secret() {
        return process.env.ENCRYPTION_SECRET;
    },
    get jwt_secret() {
        return process.env.JWT_SECRET;
    },
};
//# sourceMappingURL=config.js.map