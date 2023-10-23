import { useEffect, useState } from 'react';

import { useAppDispatch } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import type { TIntegrationListing } from '@utils/types';

const useQueryMenuPickedFoods = ({
  restaurantId,
  ids,
}: {
  restaurantId: string;
  ids: string[];
}) => {
  const dispatch = useAppDispatch();

  const [menuPickedFoods, setMenuPickedFoods] = useState<TIntegrationListing[]>(
    [],
  );

  const {
    value: queryMenuPickedFoodsInProgress,
    setTrue: turnOnMenuPickedFoodsInProgress,
    setFalse: turnOffMenuPickedFoodsInProgress,
  } = useBoolean(false);

  useEffect(() => {
    const queryMenuPickedFoods = async () => {
      if (ids.length > 0) {
        turnOnMenuPickedFoodsInProgress();
        const { payload, error } = (await dispatch(
          foodSliceThunks.queryMenuPickedFoods({
            restaurantId,
            ids,
          }),
        )) as any;
        if (!error) {
          setMenuPickedFoods(payload);
        }
        turnOffMenuPickedFoodsInProgress();
      }
    };
    queryMenuPickedFoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(ids), restaurantId]);

  return { menuPickedFoods, queryMenuPickedFoodsInProgress };
};

export default useQueryMenuPickedFoods;
