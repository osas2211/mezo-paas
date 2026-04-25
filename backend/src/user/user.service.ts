import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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

    if (user) {
      return {
        user,
        message: 'User info retrieved successfully',
      };
    } else throw new NotFoundException('User not found');
  }
}
