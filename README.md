
## User focused summary


We aimed to address a developer experience issue by creating a client-side infrastructure framework. Our framework enables developers to interact with Cosmos Multichain without needing in-depth knowledge of underlying blockchain mechanics. This is advantageous as it allows developers to work more efficiently, without being overwhelmed by the extensive information required to build applications on the Cosmoverse platform. This abstraction layer streamlines the development experience, allowing developers to work more efficiently and effectively.


 - Our product is built on top of the existing Hummingbot Gateway platform, which serves as a REST API server.

 - Our product is designed with security in mind. This product ensures the protection of communications through the use of HTTPS, which encrypts data transmitted between the user and the server. Additionally, sensitive information such as private keys is further secured by encrypting it with the user's password.
 
 - Our product boasts a highly scalable architecture that enables seamless integration and expansion of new connections.
  
 - Our product operates independently, eliminating the reliance on third-party data or services. Instead, we directly index and retrieve information from blockchains, ensuring a reliable and secure source of data.

## The Problem

We have identified a pressing problem in the industry and are confident that our solution meets an unmet need, positioning us at the forefront of this market. The existing complexity and steep learning curve act as significant barriers for developers, impeding the growth of the ecosystem as a whole. In response, we have developed a groundbreaking project that reduces this complexity and accelerates development for users.

Our journey began with the firsthand experience of solving the White Whale protocol challenge, which involved building a market-making bot. This firsthand experience highlighted the importance of simplifying the learning curve for end users, attracting more individuals to the ecosystem. To address this, we offer users a prebuilt, ready-to-use client-side server that can be easily deployed on their workstations. Additionally, for rapid prototyping, we will provide public servers for users to interact with.

Our product goes beyond limiting itself to a single exchange or market. Instead, our vision encompasses all chains and markets. We have developed custom backends that facilitate interaction with various chains and their applications, providing us with the ability to expand across multiple chains. While decentralized exchanges remain our primary focus, we are committed to encompassing the broad spectrum of DeFi functionality within a single, user-friendly framework. By striving to integrate most, if not all, DeFi features, we aim to simplify and democratize access to decentralized finance for a wider audience.


# Hummingbot Gateway

Hummingbot Gateway is a REST API that exposes connections to various blockchains (wallet, node & chain interaction) and decentralized exchanges (pricing, trading & liquidity provision). It is written in Typescript and takes advantage of existing blockchain and DEX SDKs. The advantage of using gateway is it provideds a programming language agnostic approach to interacting with blockchains and DEXs.

[Original Hummingbot Gateway Project](https://github.com/hummingbot/gateway)

Gateway may be used alongside the main [Hummingbot client](https://github.com/hummingbot/hummingbot) to enable trading on DEXs, or as a standalone module by external developers.

## Installation

### Run Gateway from source

Dependencies:
* NodeJS (16.0.0 or higher)
* pnpm: run `npm install -g pnpm` after installing NodeJS

```bash
# Install dependencies
pnpm i

# Complile Typescript into JS
$ pnpm build

# Create certificate folder in root directory
mkdir certs/

# Run Gateway setup script, which helps you set configs and CERTS_PATH.
# When promted for CERTS_PATH use created certs directory. Write simply certs
# When promted if we want to proceed, choose Yes.
# Ignore errors
$ chmod a+x gateway-setup.sh
$ ./gateway-setup.sh

# Create certs using Python util
python3 ssl_cert.py <PASSPHRASE>


# Start the Gateway server using PASSPHRASE
$ pnpm start --passphrase=<PASSPHRASE>
```

## Postman workspace

Guide: https://docs.hummingbot.org/gateway/testing/#testing-with-postman

Workspace: https://www.postman.com/cryptassic/workspace/galaxygainz/overview

NOTE: Don't forget to add SSL certificates to postman. Certificate:  **ca_cert.pem**


### Run Gateway using Docker

Dependencies:
* [Docker](https://docker.com)

See the [`/docker`](./docker) folder for Docker installation scripts and instructions on how to use them.


### Build Gateway Docker Image locally

Dependencies:
* [Docker](https://docker.com)

To build the gateway docker image locally execute the below make command:

```bash
make docker
```

Pass the `${TAG}` environmental variable to add a tag to the docker
image. For example, the below command will create the `hummingbot/gateway:dev`
image.

```bash
TAG=dev make docker
```

## Documentation

See the [official Gateway docs](https://docs.hummingbot.org/gateway/).


#### Unit tests

Run an individual test folder or file, because all tests will be resource intensive.

```bash
npx jest cosmos.base.test.ts
```
