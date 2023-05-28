import { BigNumber, Contract, Transaction } from 'ethers';
import { ethers } from 'ethers';
import LRUCache from 'lru-cache';
import { ZigZagConfig } from './zigzag.config';
import axios from 'axios';
import { Ethereum } from '../../chains/ethereum/ethereum';
import { Token } from '@uniswap/sdk-core';
import { ZigZagTrade } from '../../services/common-interfaces';
import { ZigZagish } from '../../services/common-interfaces';
import { logger } from '../../services/logger';
import { EVMTxBroadcaster } from '../../chains/ethereum/evm.broadcaster';
import { abi } from './zigzag.exchange.abi.json';

// https://api.arbitrum.zigzag.exchange/v1/info

// https://zigzag-exchange.herokuapp.com/api/coingecko/v1/pairs/42161
// https://zigzag-exchange.herokuapp.com/api/coingecko/v1/tickers/42161
// https://zigzag-exchange.herokuapp.com/api/coingecko/v1/orderbook/42161/?ticker_id=eth-ust
// https://zigzag-exchange.herokuapp.com/api/coingecko/v1/historical_trades/42161?ticker_id=eth-ust&type=b

export type ZigZagMarket = {
  buyToken: string;
  sellToken: string;
  verified: boolean;
};

export type ZigZagToken = {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
};

export type ZigZagInfo = {
  markets: Array<ZigZagMarket>;
  verifiedTokens: Array<ZigZagToken>;
  exchange: {
    exchangeAddress: string;
    makerVolumeFee: number;
    takerVolumeFee: number;
    // domain: EIP712DomainInfo;
    // types: EIP712TypeInfo;
  };
};

export interface Market {
  market: string;
  baseSymbol: string;
  quoteSymbol: string;
  lastPrice: number;
  lowestAsk: number;
  highestBid: number;
  baseVolume: number;
  quoteVolume: number;
  priceChange: number;
  priceChangePercent_24h: number;
  highestPrice_24h: number;
  lowestPrice_24h: number;
  numberOfTrades_24h: number;
}

export type RouteMarket = {
  buyTokenAddress: string;
  sellTokenAddress: string;
};

export type ZigZagOrder = {
  order: {
    user: string;
    buyToken: string;
    sellToken: string;
    buyAmount: string;
    sellAmount: string;
    expirationTimeSeconds: string;
  };
  signature: string;
};

export class ZigZag implements ZigZagish {
  private static _instances: LRUCache<string, ZigZag>;
  private _ready = false;
  private _chain: Ethereum;
  private _network: string;
  private _router: Contract;
  private tokenList: Record<string, Token> = {}; // keep track of tokens that are in a ZigZag market
  // public markets: Array<string> = []; // keep track of ZigZag markets, ZZ-USDT
  public markets: Array<string> = []; // keep track of ZigZag markets, 0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9-0xf4037f59c92c9893c43c2372286699430310cfe7
  public config;
  gasLimitEstimate: number;

  private constructor(network: string) {
    this._chain = Ethereum.getInstance(network);
    this.config = ZigZagConfig.config;
    this._network = network;
    this._router = new Contract(
      this.config.contractAddress(this._network),
      abi,
      this._chain.provider
    );
    this.gasLimitEstimate = this._chain.gasLimitTransaction;
  }

  public static getInstance(network: string): ZigZag {
    if (ZigZag._instances === undefined) {
      ZigZag._instances = new LRUCache<string, ZigZag>({
        max: 2,
      });
    }
    const instanceKey = network;
    if (!ZigZag._instances.has(instanceKey)) {
      ZigZag._instances.set(instanceKey, new ZigZag(network));
    }

    return ZigZag._instances.get(instanceKey) as ZigZag;
  }

  // public async loadMarkets() {
  //   this.parsedMarkets = await axios.get(
  //     'https://zigzag-exchange.herokuapp.com/api/v1/markets'
  //   );
  // }

  public getTokenByAddress(address: string): Token {
    return this.tokenList[address.toLowerCase()];
  }

  public async init() {
    await this._chain.init();
    const response = await axios.get(
      'https://api.arbitrum.zigzag.exchange/v1/info'
    );
    if (response.status === 200) {
      const zigZagData: ZigZagInfo = response.data;
      for (const token of zigZagData.verifiedTokens) {
        this.tokenList[token.address.toLowerCase()] = new Token(
          this._chain.chainId,
          token.address.toLowerCase(),
          token.decimals,
          token.symbol,
          token.name
        );
      }
      for (const market of zigZagData.markets) {
        const base = this.tokenList[market.buyToken];
        const quote = this.tokenList[market.sellToken];
        // this.markets.push(base.symbol + '-' + quote.symbol);
        this.markets.push(
          base.address.toLowerCase() + '-' + quote.address.toLowerCase()
        );
      }
    }

    this._ready = true;
  }

  public ready(): boolean {
    return this._ready;
  }

  public async getMarketOrders(
    buyTokenAddress: string,
    sellTokenAddress: string,
    minExpires: string
  ): Promise<Array<ZigZagOrder>> {
    const response = await axios.get(
      `https://api.arbitrum.zigzag.exchange/v1/orders?buyToken=${buyTokenAddress}&sellToken=${sellTokenAddress}&minExpires=${minExpires}`
    );

    return response.data.orders;
  }

  // For an array of possible routes, get recent orders for the corresponding markets
  public async getOrderBook(
    possibleRoutes: Array<Array<RouteMarket>>
  ): Promise<{ [key: string]: Array<ZigZagOrder> }> {
    const minExpires = (Date.now() / 1000 + 11).toFixed(0);
    const minTimeStamp: number = Date.now() / 1000 + 10;
    const newOrderBook: { [key: string]: Array<ZigZagOrder> } = {};

    const promise0 = possibleRoutes.map(async (routes: Array<RouteMarket>) => {
      const promise1 = routes.map(async (market: RouteMarket) => {
        const requestSellTokenAddress = market.sellTokenAddress;
        const requestBuyTokenAddress = market.buyTokenAddress;
        const orders = await this.getMarketOrders(
          requestBuyTokenAddress,
          requestSellTokenAddress,
          minExpires
        );
        const goodOrders = orders.filter(
          (order: ZigZagOrder) =>
            minTimeStamp < Number(order.order.expirationTimeSeconds)
        );
        const key = `${requestBuyTokenAddress}-${requestSellTokenAddress}`;
        newOrderBook[key] = goodOrders;
      });
      await Promise.all(promise1);
    });
    await Promise.all(promise0);

    return newOrderBook;
  }

  // if a direct market between two pairs exists, use it. Otherwise generate
  // routes using stable coins.
  public getPossibleRoutes(
    sellToken: Token,
    buyToken: Token
  ): Array<Array<RouteMarket>> {
    const newRoute: Array<Array<RouteMarket>> = [];
    const tradeMarket = `${sellToken.address.toLowerCase()}-${buyToken.address.toLowerCase()}`;

    // check for a direct route between pairs, if this exists, use it.
    if (this.markets.includes(tradeMarket)) {
      newRoute.push([
        {
          buyTokenAddress: sellToken.address.toLowerCase(),
          sellTokenAddress: buyToken.address.toLowerCase(),
        },
      ]);
    }

    // check routes via other tokens
    if (newRoute.length === 0) {
      const possibleRoutes = [
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
        '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
      ];
      possibleRoutes.forEach((routeTokenAddress) => {
        const firstTradeMarket = `${sellToken.address.toLowerCase()}-${routeTokenAddress.toLowerCase()}`;
        const secondTradeMarket = `${routeTokenAddress.toLowerCase()}-${buyToken.address.toLowerCase()}`;
        if (
          this.markets.includes(firstTradeMarket) &&
          this.markets.includes(secondTradeMarket)
        ) {
          newRoute.push([
            {
              buyTokenAddress: sellToken.address.toLowerCase(),
              sellTokenAddress: routeTokenAddress.toLowerCase(),
            },
            {
              buyTokenAddress: routeTokenAddress.toLowerCase(),
              sellTokenAddress: buyToken.address.toLowerCase(),
            },
          ]);
        }
      });
    }

    return newRoute;
  }

  // estimate trade details between two tokens
  public async estimate(
    sellToken: Token,
    buyToken: Token,
    buyAmount: BigNumber,
    side: string
  ): Promise<ZigZagTrade> {
    let newQuoteOrderArray: Array<ZigZagOrder> = [];
    const minTimeStamp: number = Date.now() / 1000 + 5;
    let newSwapPrice: number = 0;
    let bestSwapRoute: Array<RouteMarket> = [];

    const possibleRoutes = this.getPossibleRoutes(sellToken, buyToken);
    const orderBook = await this.getOrderBook(possibleRoutes);

    possibleRoutes.forEach((route: Array<RouteMarket>) => {
      let routeSwapPrice = 0;
      const routeQuoteOrderArray: Array<ZigZagOrder> = [];
      const stepBuyAmount = buyAmount;
      route.forEach((market: RouteMarket) => {
        let marketSwapPrice = 0;
        let marketQuoteOrder: ZigZagOrder | undefined;
        const key = `${market.buyTokenAddress}-${market.sellTokenAddress}`;
        const currentOrderBook = orderBook[key];
        if (!currentOrderBook) return;

        for (let i = 0; i < currentOrderBook.length; i++) {
          const { order } = currentOrderBook[i];
          if (minTimeStamp > Number(order.expirationTimeSeconds)) return;

          const quoteSellAmount = ethers.BigNumber.from(order.sellAmount);
          const quoteBuyAmount = ethers.BigNumber.from(order.buyAmount);
          if (side === 'buy' && quoteSellAmount.lt(stepBuyAmount)) return;

          const quoteSellToken = this.tokenList[order.sellToken];
          const quoteBuyToken = this.tokenList[order.buyToken];
          if (!quoteSellToken || !quoteBuyToken) return;

          const quoteSellAmountFormated = Number(
            ethers.utils.formatUnits(quoteSellAmount, quoteSellToken.decimals)
          );
          const quoteBuyAmountFormated = Number(
            ethers.utils.formatUnits(quoteBuyAmount, quoteBuyToken.decimals)
          );

          const thisPrice = quoteSellAmountFormated / quoteBuyAmountFormated;
          if (thisPrice > marketSwapPrice) {
            marketSwapPrice = thisPrice;
            marketQuoteOrder = currentOrderBook[i];
          }
        }
        routeSwapPrice = routeSwapPrice
          ? routeSwapPrice * marketSwapPrice
          : marketSwapPrice;
        if (marketQuoteOrder) {
          routeQuoteOrderArray.push(marketQuoteOrder);
          stepBuyAmount
            .mul(marketQuoteOrder.order.buyAmount)
            .div(marketQuoteOrder.order.sellAmount);
        }
      });

      if (routeSwapPrice > newSwapPrice) {
        newSwapPrice = routeSwapPrice;
        newQuoteOrderArray = routeQuoteOrderArray;
        bestSwapRoute = route;
      }

      if (bestSwapRoute.length === 0) bestSwapRoute = route;
    });

    return {
      newSwapPrice: side === 'sell' ? newSwapPrice : 1 / newSwapPrice,
      newQuoteOrderArray: newQuoteOrderArray,
      bestSwapRoute: bestSwapRoute,
    };
  }

  /**
   * Given a wallet and a Uniswap-ish trade, try to execute it on blockchain.
   *
   * @param wallet Wallet
   * @param trade Expected trade
   */
  async executeTrade(
    walletAddress: string,
    trade: ZigZagTrade,
    rawAmount: BigNumber,
    is_buy: boolean
  ): Promise<Transaction> {
    let txData;
    if (trade.newQuoteOrderArray.length === 0)
      throw new Error('No route available.');
    else if (trade.newQuoteOrderArray.length === 1) {
      if (is_buy === true) {
        // buy
        txData = await this._router.populateTransaction.fillOrderExactOutput(
          [
            trade.newQuoteOrderArray[0].order.user,
            trade.newQuoteOrderArray[0].order.sellToken,
            trade.newQuoteOrderArray[0].order.buyToken,
            trade.newQuoteOrderArray[0].order.sellAmount,
            trade.newQuoteOrderArray[0].order.buyAmount,
            trade.newQuoteOrderArray[0].order.expirationTimeSeconds,
          ],
          trade.newQuoteOrderArray[0].signature,
          rawAmount.toString(),
          false
        );
      } else {
        // sell
        txData = await this._router.populateTransaction.fillOrderExactInput(
          [
            trade.newQuoteOrderArray[0].order.user,
            trade.newQuoteOrderArray[0].order.sellToken,
            trade.newQuoteOrderArray[0].order.buyToken,
            trade.newQuoteOrderArray[0].order.sellAmount,
            trade.newQuoteOrderArray[0].order.buyAmount,
            trade.newQuoteOrderArray[0].order.expirationTimeSeconds,
          ],
          trade.newQuoteOrderArray[0].signature,
          rawAmount.toString(),
          false
        );
      }
    } else {
      const quoteOrderCalldataArray = trade.newQuoteOrderArray.map(
        (quoteOrder: ZigZagOrder) => {
          return [
            quoteOrder.order.user,
            quoteOrder.order.sellToken,
            quoteOrder.order.buyToken,
            quoteOrder.order.sellAmount,
            quoteOrder.order.buyAmount,
            quoteOrder.order.expirationTimeSeconds,
          ];
        }
      );
      const signatureCalldataArray = trade.newQuoteOrderArray.map(
        (quoteOrder: ZigZagOrder) => quoteOrder.signature
      );
      txData = await this._router.populateTransaction.fillOrderRoute(
        Object.values(quoteOrderCalldataArray),
        Object.values(signatureCalldataArray),
        rawAmount.toString(),
        false
      );
    }
    txData.gasLimit = BigNumber.from(String(this._chain.gasLimitTransaction));
    const txResponse = await EVMTxBroadcaster.getInstance(
      this._chain,
      walletAddress
    ).broadcast(txData);

    logger.info(txResponse);
    return txResponse;
  }
}
