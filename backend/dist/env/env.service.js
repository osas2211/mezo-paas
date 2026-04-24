"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvService = void 0;
const common_1 = require("@nestjs/common");
let EnvService = class EnvService {
    port = process.env.PORT;
    mezoRpcUrl = process.env.MEZO_RPC_URL;
    mezoWssRpcUrl = process.env.MEZO_WSS_RPC_URL;
    mezoChainId = process.env.MEZO_CHAIN_ID;
    mezoDecimal = process.env.MEZO_DECIMAL;
    mezoExplorer = process.env.MEZO_EXPLORER;
    encryption_secret = process.env.ENCRYPTION_SECRET;
};
exports.EnvService = EnvService;
exports.EnvService = EnvService = __decorate([
    (0, common_1.Injectable)()
], EnvService);
//# sourceMappingURL=env.service.js.map