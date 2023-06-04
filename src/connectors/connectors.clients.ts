import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from '@cosmjs/cosmwasm-stargate';

export interface Client {
  ready: boolean;
  initialize(): void;
}
export interface ClientBuilder {
  builder: () => ContractClient<any>;
  postfix?: string;
}
export class ContractClient<T extends new (...args: any[]) => any>
  implements Client
{
  public ready = false;
  private client: InstanceType<T>;

  constructor(factory: () => InstanceType<T>) {
    this.client = factory();
  }
  public initialize() {
    // Some additional logic can go here
    this.ready = true;
  }

  public get getInstance(): InstanceType<T> {
    return this.client;
  }
}

export class ClientsManager {
  private static instance: ClientsManager;
  // private clients: Map<string, Client> = new Map();
  private clients: Map<string, ContractClient<any>> = new Map();

  public static getInstance(): ClientsManager {
    if (!ClientsManager.instance) {
      ClientsManager.instance = new ClientsManager();
    }

    return ClientsManager.instance;
  }

  public addClients(clientFactories: Array<ClientBuilder>) {
    clientFactories.forEach(({ builder, postfix }) => {
      const client = builder();
      // Accessing inner instance name which will be used as key for mapping.
      // ContractClient<T> => T.constructor.name
      const index = postfix
        ? `${client.getInstance.constructor.name}_${postfix}`
        : client.getInstance.constructor.name;

      client.initialize();
      this.clients.set(index, client);
    });
  }

  public getClient<T>(
    _: new (...args: any[]) => T,
    postfix?: string
  ): T | undefined {
    // Using class name as our index, if prefix is specified, then we build index of class name+prefix
    // TerraswapPairQueryClient_{contract_address}
    const index = postfix ? `${_.name}_${postfix}` : _.name;

    const client = this.clients.get(index)?.getInstance;

    return client as T | undefined;
  }

  public get isReady(): boolean {
    let allClientsReady = true;

    this.clients.forEach((client) => {
      if (!client.ready) allClientsReady = false;
    });

    return allClientsReady;
  }
}

// Query client only queries data from blockchain. So, it's like read only client.
export function getQueryClientBuilder<T extends new (...args: any[]) => any>(
  clientType: T,
  wasm: CosmWasmClient,
  contractAddress: string,
  postfixRequired: boolean = false
): ClientBuilder {
  return {
    builder: () => new ContractClient(new clientType(wasm, contractAddress)),
    postfix: postfixRequired ? contractAddress : undefined,
  };
}

// Execute client does not have read ability, but have ability to execute. Like interact with the smart contract.
export function getExecuteClientBuilder<T extends new (...args: any[]) => any>(
  clientType: T,
  singingCosmWasmClient: SigningCosmWasmClient,
  senderAddress: string,
  contractAddress: string,
  postfixRequired: boolean = false
) {
  return {
    builder: () =>
      new ContractClient(
        new clientType(singingCosmWasmClient, senderAddress, contractAddress)
      ),
    postfix: postfixRequired ? contractAddress : undefined,
  };
}
