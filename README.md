![diagram](docs/diagram.png)

## Quick Overview
We built a simple client-side tool to make developing on Cosmos Multichain (part of the Cosmoverse) way easier. No need to master complex blockchain details—just focus on building cool apps faster. 

**Key perks:**
- **Built on Hummingbot Gateway**: A REST API server for connecting to blockchains and DEXs (decentralized exchanges).
- **Super secure**: Uses HTTPS for all communication and encrypts your private keys with your password.
- **Scales effortlessly**: Add new chains or connections without hassle.
- **Self-reliant**: Pulls data straight from blockchains—no third-party dependencies.

## The Problem We Solve
Blockchain dev is tough—steep learning curves scare off developers and slow ecosystem growth. We learned this hands-on while building a market-making bot for White Whale protocol. 

Our fix? A ready-to-run client-side server you deploy on your own machine (or use our public test servers for quick prototypes). It works across **all Cosmos chains and DeFi apps**—not just one exchange. Think trading, liquidity, and more, all in one friendly package. We're expanding to cover most DeFi features to make it accessible for everyone.

## What is Hummingbot Gateway?
It's a TypeScript-based REST API for blockchain wallets, nodes, DEX pricing, trading, and liquidity. Works with any programming language and existing SDKs. Use it with the main [Hummingbot client](https://github.com/hummingbot/hummingbot) or standalone.

[Original GitHub Repo](https://github.com/hummingbot/gateway) | [Official Docs](https://docs.hummingbot.org/gateway/)

## Easy Installation

### From Source (Needs NodeJS 16+ and Yarn)
```bash
# Install deps & build
yarn
yarn build

# Set up certs folder
mkdir certs/

# Run setup (say "certs" for path, "Yes" to proceed—ignore errors)
chmod +x gateway-setup.sh
./gateway-setup.sh

# Generate certs (pick a strong PASSPHRASE)
python3 ssl_cert.py <YOUR_PASSPHRASE>

# Start server
yarn start --passphrase=<YOUR_PASSPHRASE>
```

**Test with Postman**: [Guide](https://docs.hummingbot.org/gateway/testing/#testing-with-postman) | [Workspace](https://www.postman.com/cryptassic/workspace/galaxygainz/overview)  
*Add `ca_cert.pem` as SSL cert.*

### Docker (Easiest for Most)
- Install [Docker](https://www.docker.com).
- Check `/docker` folder for scripts.

**Build Local Image**:
```bash
make docker  # Or: TAG=dev make docker for custom tag
```

## Quick Testing
Run specific tests (full suite is heavy):
```bash
npx jest cosmos.base.test.ts
```

Dive in, build fast, and join the Cosmos DeFi revolution—without the headaches! 🚀
