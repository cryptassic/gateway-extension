

Use cases
Trader(User):
 Storage:
 - Traders store their transaction data;
 Cache:
 - Traders cache transactions for faster retrieval. This is stored at local short term cache;
 Search: 
 - Traders search for secure(from MEV) chains;
 - Traders search for chains;
 - Traders search for existing exchanges;
 - Traders search for tokens;
 - Traders search for pairs;
 - Traders search for stablecoin pairs;
 - Traders search for possible interchain routes;
 - Traders search for their transactions: by symbol, by time, by exchange, by hash;
 - Traders search for their operational expenses: total paid gas costs - by symbol, by time, by exchange, by pool, by hash;
 Trade:
 - Traders can buy tokens;
 - Traders can sell tokens;
 - Traders can estimate slippage of the trade;
 - Traders can query pool fees factor;
 - Traders can look up for nominal value of trade. How much $ this token is worth in stablecoin pool;
 - Traders can use FlashLoans;



DEX:
 - Should be searchable by chainId, by chainName, by pair, by asset, by factory, by router;

Networks(mainnet,testnet):
 - Should be searchable by chainId, by chainName, by dex, by asset, by tags {protected};

Chains:
 - Should be searchable by networks, by chainId, by dex, by asset;

Factories:
 - Should be searchable by dex, by pair, by router, by chainName, by chainId;

Routers:
 - Should be searchable by dex, by pair, by factory, by asset, by chainName, by chainId;
 
Pairs:
 - Should be searchable by dex, by chainId, by chainName, by network, by asset, by factory, by router, by asset ,by tags - {stablecoin, native_assets, protected};

Assets:
 - Should be searchable by dex, by chainId, by chainName, by network, by factory, by router, by tags - {stablecoin, native_chain_asset}, by symbol, by denom, by wallet, by contract_address, by ibc_address


Attributes
DEX:
 - name
 - chainId
 - chainName
 - network
 - pairs
 - factory
 - router

Network:
 - name
 - chainId
 - chainName
 - dexes
 - assets
 - protected

Chain:
 - name
 - chainId
 - networks
 - dexes
 - assets

Factory:
 - name
 - router
 - chainId
 - chainName
 - network
 - dex
 - pairs

Router:
 - name
 - dex
 - chainId
 - chainName
 - network
 - factory
 - pairs
 - assets

Pair:
 - name
 - dex
 - chainId
 - chainName
 - network
 - factory
 - router
 - assets
 - liquidity_asset
 - pair_type
 - stable_asset(stablecoin)
 - native_assets(true|false)
 - protected(true|false)
 
Asset:
 - name
 - dex
 - symbol
 - chainId
 - chainName
 - total_supply
 - metadata
 - decimals
 - owner

Transaction:
 - hash
 - type
 - gas_cost
 - timestamp
 - code
 - tags(dex,symbol,asset) 

IBC_Channel:
 - source_chainId
 - destination_chainId
 - tx_channelId
 - rx_channelId

IBC_Mapping:
 - id
 - symbol
 - chainId_1
 - chainId_2
 - chainName_1
 - chainname_2
 - address_1
 - address_2
