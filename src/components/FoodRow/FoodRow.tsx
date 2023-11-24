import React, { useMemo } from 'react';

import IconMoneyReceive from '@components/Icons/IconMoneyReceive/IconMoneyReceive';
import Tooltip from '@components/Tooltip/Tooltip';
import { parseThousandNumber } from '@helpers/format';
import { searchKeywords } from '@helpers/titleHelper';

import css from './FoodRow.module.scss';

type TFoodRowProps = {
  foodName: string;
  price: number;
  minQuantity: number;
  keywords?: string | string[];
  highLightClass?: string;
};

type HighLightedFoodName =
  | string
  | {
      text: string;
      isMatchKeywords: boolean;
    }[];

const FoodRow: React.FC<TFoodRowProps> = ({
  foodName,
  price,
  minQuantity,
  keywords,
  highLightClass,
}) => {
  const foodNameHighlight = useMemo<HighLightedFoodName>(() => {
    if (!keywords) {
      return foodName;
    }

    return searchKeywords(foodName, keywords);
  }, [keywords, foodName]);

  const isFoodNameHasHighlightWords = Array.isArray(foodNameHighlight);

  return (
    <tr className={css.tableRow}>
      <td>
        <div className={css.footerFood}>
          <Tooltip tooltipContent={foodName} placement="top">
            <span className={css.foodName}>
              {isFoodNameHasHighlightWords
                ? foodNameHighlight.map((word) => (
                    <span
                      key={word.text}
                      className={word.isMatchKeywords ? highLightClass : ''}>
                      {word.text}{' '}
                    </span>
                  ))
                : foodNameHighlight}
            </span>
          </Tooltip>
        </div>
      </td>
      <td>
        <div className={[css.footerFood, css.footerFoodAlignRight].join(' ')}>
          <span>{parseThousandNumber(price)}đ</span>
        </div>
      </td>
      <td>
        <div className={[css.footerFood, css.footerFoodAlignRight].join(' ')}>
          <span>{minQuantity}</span>
          <IconMoneyReceive className={css.footerFoodIcon} />
        </div>
      </td>
    </tr>
  );
};

export default FoodRow;
