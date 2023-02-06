import { useAppDispatch } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import type { TIntergrationListing } from '@utils/types';
import { useEffect, useState } from 'react';

const useQueryMenuPickedFoods = ({
  restaurantId,
  ids,
}: {
  restaurantId: string;
  ids: string[];
}) => {
  const dispatch = useAppDispatch();

  const [menuPickedFoods, setMenuPickedFoods] = useState<
    TIntergrationListing[]
  >([]);

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
  }, [dispatch, JSON.stringify(ids), restaurantId]);

  return { menuPickedFoods, queryMenuPickedFoodsInProgress };
};

export default useQueryMenuPickedFoods;
