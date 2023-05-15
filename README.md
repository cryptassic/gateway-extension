
## User focused summary


## Investor pitch


## Development Deepdive


## Presentation
Video: https://vimeo.com/827020448

Slideshow:https://www.canva.com/design/DAFiCdFXKLc/aDM112fV_M6bO4alrP6COA/view?utm_content=DAFiCdFXKLc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink


## DEMO
Video: https://vimeo.com/827016331




# Hummingbot Gateway

Hummingbot Gateway is a REST API that exposes connections to various blockchains (wallet, node & chain interaction) and decentralized exchanges (pricing, trading & liquidity provision). It is written in Typescript and takes advantage of existing blockchain and DEX SDKs. The advantage of using gateway is it provideds a programming language agnostic approach to interacting with blockchains and DEXs.

Gateway may be used alongside the main [Hummingbot client](https://github.com/hummingbot/hummingbot) to enable trading on DEXs, or as a standalone module by external developers.

## Installation

### Generate certificates

To run Gateway in `https` (default):
```bash
# Create certificate folder in root directory
mkdir certs/

# Create certs using Python util
python3 ssl_cert.py YOUR_PASSPHRASE

# Verify that certs folder is has certificates.
```


### Run Gateway from source

Dependencies:
* NodeJS (16.0.0 or higher)
* Yarn: run `npm install -g yarn` after installing NodeJS

```bash
# Install dependencies
yarn

# Complile Typescript into JS
$ yarn build

# Run Gateway setup script, which helps you set configs and CERTS_PATH
$ chmod a+x gateway-setup.sh
$ ./gateway-setup.sh

# Start the Gateway server using PASSPHRASE
$ yarn start --passphrase=<PASSPHRASE>
```

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

The API is documented using [Swagger](./docs/swagger). When Gateway is started, it also generates Swagger API docs at: https://localhost:8080


#### Unit tests

Read this document for more details about how to write unit test in gateway: [How we write unit tests for gateway](./docs/testing.md).

Run an individual test folder or file, because all tests are will be resource intensive

```bash
npx jest cosmos.base.test.ts
```
