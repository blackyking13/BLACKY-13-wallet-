import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { Asset } from '@prisma/client';

export class BuyAssetDto {
  @IsEnum(Asset)
  asset: Asset;

  @IsNumber()
  @IsPositive()
  usdAmount: number;
}
