export type PairType =
  | 'constant_product'
  | {
      stable_swap: {
        amp: number;
      };
    };
