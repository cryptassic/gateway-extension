export interface Client {
  ready: boolean;
  initialize(): void;
}

export class QueryClient<T extends new (...args: any[]) => any>
  implements Client
{
  public ready = false;
  private client: InstanceType<T>;

  constructor(ClientClass: T, cosmWasmClient: any, contractAddress: string) {
    this.client = new ClientClass(cosmWasmClient, contractAddress);
    this.initialize();
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
  private clients: Map<string, Client> = new Map();

  public static getInstance(): ClientsManager {
    if (!ClientsManager.instance) {
      ClientsManager.instance = new ClientsManager();
    }

    return ClientsManager.instance;
  }

  public initializeClients(clientFactories: Array<() => Client>) {
    clientFactories.forEach((factory) => {
      const client = factory();
      client.initialize();
      this.clients.set(client.constructor.name, client);
    });
  }

  public getClient(name: string): Client | undefined {
    return this.clients.get(name);
  }

  public get isReady(): boolean {
    let allClientsReady = true;

    this.clients.forEach((client) => {
      if (!client.ready) allClientsReady = false;
    });

    return allClientsReady;
  }
}
