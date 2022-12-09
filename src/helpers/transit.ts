import Decimal from 'decimal.js';

import { transit, types as sdkTypes } from './sdkLoader';

const sdkTransitVerbose =
  process.env.REACT_APP_SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true';

export const typeHandlers = [
  // Use Decimal type instead of SDK's BigDecimal.
  {
    type: sdkTypes.BigDecimal,
    customType: Decimal,
    writer: (v: any) => new sdkTypes.BigDecimal(v.toString()),
    reader: (v: any) => new Decimal(v.value),
  },
];

export const serialize = (data: any) => {
  return transit.write(data, {
    typeHandlers,
    verbose: sdkTransitVerbose,
  });
};

export const deserialize = (str: string) => {
  return transit.read(str, { typeHandlers });
};
