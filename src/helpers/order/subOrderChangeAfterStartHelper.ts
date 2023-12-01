import type { TObject, TSubOrderChangeHistoryItem } from '@src/utils/types';

export const checkOrderDetailHasChanged = (
  draftSubOrderChangesHistory: TObject<string, TSubOrderChangeHistoryItem[]>,
) => {
  return Object.keys(draftSubOrderChangesHistory).some((dateAsTimeStamp) => {
    return draftSubOrderChangesHistory[dateAsTimeStamp].length > 0;
  });
};
