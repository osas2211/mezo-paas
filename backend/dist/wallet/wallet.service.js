"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const config_1 = require("../lib/config");
let WalletService = class WalletService {
    provider;
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(config_1.env_config.mezoRpcUrl);
    }
    generateWallet() {
        const wallet = ethers_1.ethers.Wallet.createRandom(this.provider);
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic?.phrase,
        };
    }
    async signTransaction(privateKey, to, valueInBTC) {
        const wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
        const tx = await wallet.sendTransaction({
            to,
            value: ethers_1.ethers.parseEther(valueInBTC),
        });
        return tx.hash;
    }
    async signMessage(privateKey, message) {
        const wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
        return await wallet.signMessage(message);
    }
    async signContractCall(privateKey, contractAddress, abi, method, args) {
        const wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, abi, wallet);
        const tx = await contract[method](...args);
        return tx.hash;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WalletService);
//# sourceMappingURL=wallet.service.js.map