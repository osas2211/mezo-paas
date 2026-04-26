import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { WalletService } from 'src/wallet/wallet.service'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, private readonly walletService: WalletService) { }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        wallet: true,
        password: false,
        email: true,
        name: true,
        id: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (user) {
      const balance = await this.walletService.getMUSDTokenBalance(user?.wallet?.address!)
      return {
        user: {
          ...user,
          wallet: {
            ...user.wallet,
            balance: balance
          }
        },
        message: 'User info retrieved successfully',
      }
    } else throw new NotFoundException('User not found')
  }
}
