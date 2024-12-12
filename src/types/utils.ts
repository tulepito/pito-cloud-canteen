export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type Object = Record<string, any>;

interface Landscape {
  height: number;
  width: number;
  url: string;
  name: string;
}

type VariantKey =
  | 'landscape-crop4x'
  | 'landscape-crop'
  | 'landscape-crop2x'
  | 'landscape-crop6x';

export type Variants = Record<VariantKey, Landscape>;

export interface Id {
  _sdkType: string;
  uuid: string;
}

export interface Image {
  id: Id;
  type: string;
  attributes: {
    variants: Variants;
  };
}

export interface Price {
  _sdkType: string;
  amount: number;
  currency: string;
}

export type Attributes<
  Ext extends Object = {},
  Pub extends Object = {},
  M extends Object = {},
  Pri extends Object = {},
> = Ext & {
  title: string;
  description: string;
  createdAt: string;
  geolocation: unknown;
  deleted: boolean;
  state: string;
  availabilityPlan: unknown;
  price: Price;
  publicData: Pub;
  metadata: M;
  privateData: Pri;
};

export type ListingBuilder<
  Attr extends Object = {},
  Pub extends Object = {},
  Meta extends Object = {},
  Pri extends Object = {},
  Ext extends Object = {},
> = DeepPartial<
  {
    id: Id;
    type: string;
    attributes: Attributes<Attr, Pub, Meta, Pri>;
  } & Ext
>;
