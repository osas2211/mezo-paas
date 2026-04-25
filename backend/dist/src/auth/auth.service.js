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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
const encryption_service_1 = require("../encryption/encryption.service");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    prisma;
    wallet;
    encryption;
    jwt;
    constructor(prisma, wallet, encryption, jwt) {
        this.prisma = prisma;
        this.wallet = wallet;
        this.encryption = encryption;
        this.jwt = jwt;
    }
    async signup(body) {
        try {
            const { password, ...rest } = body;
            const hashedPassword = await bcrypt_1.default.hash(body.password, 10);
            const user = await this.prisma.user.create({
                data: { ...rest, password: hashedPassword },
            });
            const generatedWallet = this.wallet.generateWallet();
            await this.prisma.wallet.create({
                data: {
                    encryptedMnemonic: this.encryption.encrypt(generatedWallet.mnemonic),
                    encryptedPK: this.encryption.encrypt(generatedWallet.privateKey),
                    address: generatedWallet.address,
                    userId: user.id,
                },
            });
            return {
                message: 'User created succesfully',
                user,
            };
        }
        catch (error) {
            if (error.code === 'P2002')
                throw new common_1.BadRequestException('User with same email already exists');
            throw new common_1.BadRequestException('Something went wrong');
        }
    }
    async login(body) {
        const user = await this.prisma.user.findUnique({
            where: { email: body.email },
            include: { wallet: true },
        });
        if (user) {
            const { password, ...rest } = user;
            const result = await bcrypt_1.default.compare(body.password, user.password);
            const payload = {
                userId: user.id,
                address: user.wallet?.address,
                email: user.email,
            };
            const access_token = await this.jwt.signAsync(payload);
            if (result) {
                return {
                    message: 'Login successfully',
                    user: rest,
                    access_token,
                };
            }
            throw new common_1.UnauthorizedException('Incorrect password');
        }
        throw new common_1.UnauthorizedException('Incorrect email address');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        encryption_service_1.EncryptionService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map