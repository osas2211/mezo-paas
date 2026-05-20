import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import {
  TransactionType,
  TransactionAction,
} from '../../generated/prisma/enums';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

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
    });

    if (user && user.wallet) {
      const balance = await this.walletService.getMUSDTokenBalance(
        user.wallet.address,
      );
      return {
        user: {
          ...user,
          wallet: {
            ...user.wallet,
            balance: balance,
          },
        },
        message: 'User info retrieved successfully',
      };
    } else throw new NotFoundException('User not found');
  }

  async transferCredit(
    from_user_Id: string,
    to_user_email: string,
    amount: number,
  ) {
    const from_user = await this.prisma.user.findUnique({
      where: { id: from_user_Id },
      include: { wallet: true },
    });

    const to_user = await this.prisma.user.findUnique({
      where: { email: to_user_email },
      include: { wallet: true },
    });

    if (!from_user) {
      return new NotFoundException('User does not exist');
    }

    if (!to_user) {
      return new NotFoundException('Recipient User does not exist ');
    }

    const newUserCreditBalance = String(
      Number(from_user.wallet?.creditBalance) - amount,
    );
    const userTxMessage = `Transfer to ${to_user.name}`;

    const newRecipientCreditBalance = String(
      Number(from_user.wallet?.creditBalance) + amount,
    );
    const recipientTxMessage = `Transfer to ${to_user.name}`;

    await this.prisma.user.update({
      where: { id: from_user_Id },
      data: {
        wallet: { update: { creditBalance: newUserCreditBalance } },
        transactions: {
          create: {
            title: userTxMessage,
            type: TransactionType.DEBIT,
            action: TransactionAction.Transfer,
            amount: String(amount),
          },
        },
      },
    });

    await this.prisma.user.update({
      where: { email: to_user_email },
      data: {
        wallet: { update: { creditBalance: newRecipientCreditBalance } },
        transactions: {
          create: {
            title: recipientTxMessage,
            type: TransactionType.CREDIT,
            action: TransactionAction.Deposit,
            amount: String(amount),
          },
        },
      },
    });
  }
}
