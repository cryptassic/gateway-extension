/**
 * Asset represents a Cosmos SDK asset.
 *
 * @interface
 * @property {string} description - The description of the asset.
 * @property {Denomunit[]} denom_units - An array of Denomunit objects.
 * @property {string} base - The base token of the asset.
 * @property {string} name - The name of the asset.
 * @property {string} display - The display name of the asset.
 * @property {string} symbol - The symbol of the asset.
 * @property {LogoURIs} logo_URIs - An object with png and svg properties that represent the URIs for the asset's logos.
 * @property {string} coingecko_id - The CoinGecko ID for the asset.
 */


export interface Asset {
  description: string;
  denom_units: Denomunit[];
  base: string;
  address?: string;
  name: string;
  display: string;
  symbol: string;
  logo_URIs: LogoURIs;
  coingecko_id: string;
}

/**
 * LogoURIs represents the URIs for an asset's logos.
 *
 * @interface
 * @property {string} png - The URI for the asset's PNG logo.
 * @property {string} svg - The URI for the asset's SVG logo.
 */
export interface LogoURIs {
  png: string;
  svg: string;
}

/**
 * Denomunit represents the smallest fraction of an asset that can be transferred.
 *
 * @interface
 * @property {string} denom - The denomination of the smallest fraction.
 * @property {number} exponent - The power of 10 to which the smallest fraction is raised.
 */
export interface Denomunit {
  denom: string;
  exponent: number;
}

export type NativeAsset = {
  native_token: {
    denom: string;
  };
}

export type ExternalAsset = {
  token: {
    contract_addr: string;
  };
}
