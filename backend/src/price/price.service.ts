import { Injectable } from '@nestjs/common';
import { Asset } from '@prisma/client';

@Injectable()
export class PriceService {
  // TODO: Replace with a real external price feed (CoinGecko, Coinbase, etc.)
  async getPrice(asset: Asset): Promise<number> {
    switch (asset) {
      case Asset.BTC:
        return 30000; // placeholder USD price
      case Asset.ETH:
        return 2000; // placeholder USD price
      default:
        throw new Error('Unsupported asset');
    }
  }
}
