import { AbstractSwapConnector } from './connectors.base';

export class ConnectorRegistry {
  private instances = new Map<
    new (...args: any[]) => AbstractSwapConnector,
    AbstractSwapConnector
  >();

  getInstance(
    T: new (...args: any[]) => AbstractSwapConnector,
    ...args: any[]
  ): AbstractSwapConnector | undefined {
    let instance = this.instances.get(T);

    if (!instance) {
      try {
        instance = new T(...args);
        this.instances.set(T, instance);
      } catch (error) {
        console.log(
          `${new Date().toISOString()} - 
          Failed to instantiate connector. Probably because connector is not available. 
          Please check chain & network params and make sure this connector supports it. ${error}`
        );
      }
    }

    return instance;
  }
}

export const connectorRegistry = new ConnectorRegistry();
