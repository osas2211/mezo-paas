import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import {
  TransactionType,
  TransactionAction,
  DeploymentStatus,
} from '../../generated/prisma/enums';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) { }

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
        role: true
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
      throw new NotFoundException('User does not exist');
    }

    if (!to_user) {
      throw new NotFoundException('Recipient User does not exist ');
    }

    if (Number(amount) > Number(from_user.wallet?.creditBalance)) {
      throw new Error('Insufficient credits');
    }

    const newUserCreditBalance = String(
      Number(from_user.wallet?.creditBalance) - amount,
    );
    const userTxMessage = `Transfer to ${to_user.name}`;

    const newRecipientCreditBalance = String(
      Number(to_user.wallet?.creditBalance) + amount,
    );
    const recipientTxMessage = `Transfer from ${to_user.name}`;

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

  async getTransactionHistory(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { transactions, message: 'Transactions retrieved successfully' };
  }

  async getAdminAnalytics() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            address: true,
            creditBalance: true,
            stakedBalance: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            framework: true,
            active: true,
            dailyCreditCost: true,
            creditUsedThisMonth: true,
            createdAt: true,
            deployment: {
              select: {
                status: true,
                url: true,
              },
            },
          },
        },
        _count: {
          select: {
            projects: true,
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary stats
    const totalUsers = users.length;
    const proUsers = users.filter((u) => u.role === 'PRO_DEVELOPER').length;
    const regularUsers = users.filter(
      (u) => u.role === 'REGULAR_DEVELOPER',
    ).length;

    const totalProjects = users.reduce((acc, u) => acc + u._count.projects, 0);
    const activeProjects = users.reduce(
      (acc, u) => acc + u.projects.filter((p) => p.active).length,
      0,
    );

    const totalCredits = users.reduce(
      (acc, u) => acc + Number(u.wallet?.creditBalance || 0),
      0,
    );
    const totalStaked = users.reduce(
      (acc, u) => acc + Number(u.wallet?.stakedBalance || 0),
      0,
    );

    // Format user data for response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      wallet: user.wallet
        ? {
            address: user.wallet.address,
            creditBalance: user.wallet.creditBalance,
            stakedBalance: user.wallet.stakedBalance,
          }
        : null,
      projectCount: user._count.projects,
      transactionCount: user._count.transactions,
      activeProjectCount: user.projects.filter((p) => p.active).length,
      projects: user.projects.map((p) => ({
        id: p.id,
        name: p.name,
        framework: p.framework,
        active: p.active,
        dailyCreditCost: p.dailyCreditCost,
        creditUsedThisMonth: p.creditUsedThisMonth,
        createdAt: p.createdAt,
        deploymentStatus: p.deployment?.status || null,
        deploymentUrl: p.deployment?.url || null,
      })),
    }));

    return {
      summary: {
        totalUsers,
        proUsers,
        regularUsers,
        totalProjects,
        activeProjects,
        inactiveProjects: totalProjects - activeProjects,
        totalCredits: totalCredits.toFixed(2),
        totalStaked: totalStaked.toFixed(2),
      },
      users: formattedUsers,
      message: 'Admin analytics retrieved successfully',
    };
  }
}
