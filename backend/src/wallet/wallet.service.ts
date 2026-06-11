import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceService } from '../price/price.service';
import { Asset } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private priceService: PriceService,
  ) {}

  async buyAsset(userId: string, asset: Asset, usdAmount: number) {
    if (!userId) throw new BadRequestException('userId is required');
    if (usdAmount <= 0) throw new BadRequestException('usdAmount must be positive');

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const price = await this.priceService.getPrice(asset);
    if (!price || price <= 0) throw new BadRequestException('Invalid price from price service');

    const quantity = usdAmount / price;

    if (wallet.balance < usdAmount) throw new BadRequestException('Insufficient USD balance');

    const result = await this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        balance: { decrement: usdAmount },
      };
      if (asset === Asset.BTC) updateData.btc = { increment: quantity };
      if (asset === Asset.ETH) updateData.eth = { increment: quantity };

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: updateData,
      });

      const txRecord = await tx.transaction.create({
        data: {
          userId,
          type: 'BUY',
          asset,
          amountUsd: usdAmount,
          quantity,
        },
      });

      return { updatedWallet, txRecord };
    });

    return {
      wallet: result.updatedWallet,
      transaction: result.txRecord,
    };
  }
}
