import { useMemo } from 'react';
import { format } from 'date-fns';

import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldLabelCheckbox from '@components/FormFields/FieldLabelCheckbox/FieldLabelCheckbox';
import FieldRating from '@components/FormFields/FieldRating/FieldRating';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';

import css from './OrderRatingForm.module.scss';

type TPackagingRatingProps = {
  values: any;
  restaurantsByDay: any;
  isShowTitle?: boolean;
};

const OPTIONAL_PACKAGING_RESTAURANT_SATISFACTED =
  'optionalPackaging-restaurant-satifacted';
const OPTIONAL_PACKAGING_RESTAURANT_UNSATISFACTED =
  'optionalPackaging-restaurant-unsatifacted';
const PackagingRating: React.FC<TPackagingRatingProps> = (props) => {
  const { values, restaurantsByDay, isShowTitle } = props;
  const isPackagingSelected = values?.packaging;
  const isPackagingSatifactedSelected =
    values?.packaging && values?.packaging >= 3;
  const isPackagingRestaurantSelected =
    values?.[OPTIONAL_PACKAGING_RESTAURANT_SATISFACTED] ||
    values?.[OPTIONAL_PACKAGING_RESTAURANT_UNSATISFACTED];

  const basicOptionalUnsatifactedPackagingRatingOptions = [
    {
      key: 'sanitary',
      label: 'Vệ sinh',
    },
    {
      key: 'hard-usage',
      label: 'Khó sử dụng',
    },
    {
      key: 'not-aesthetics',
      label: 'Thẩm mỹ',
    },
    {
      key: 'unsuitable',
      label: 'Không phù hợp',
    },
    {
      key: 'enviromental-influence',
      label: 'Ảnh hưởng môi trường',
    },
    {
      key: 'other',
      label: 'Khác',
    },
  ];

  const optionalUnsatifactedPackagingRatingOptions = useMemo(() => {
    if (
      !isPackagingSatifactedSelected &&
      values?.[OPTIONAL_PACKAGING_RESTAURANT_UNSATISFACTED]
    ) {
      return basicOptionalUnsatifactedPackagingRatingOptions.map((option) => ({
        ...option,
        key: `${values?.[OPTIONAL_PACKAGING_RESTAURANT_UNSATISFACTED]} - ${option.key}`,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPackagingSatifactedSelected, values]);

  const basicOptionalSatifactedPackagingRatingOptions = [
    {
      key: 'sanitary',
      label: 'Vệ sinh',
    },
    {
      key: 'aesthetics',
      label: 'Thẩm mỹ',
    },
    {
      key: 'user-friendly',
      label: 'Dễ sử dụng',
    },
    {
      key: 'versatile',
      label: 'Đa năng',
    },
    {
      key: 'other',
      label: 'Khác',
    },
  ];

  const optionalSatifactedPackagingRatingOptions = useMemo(() => {
    if (
      isPackagingSatifactedSelected &&
      values?.[OPTIONAL_PACKAGING_RESTAURANT_SATISFACTED]
    ) {
      return basicOptionalSatifactedPackagingRatingOptions.map((option) => ({
        ...option,
        key: `${values?.[OPTIONAL_PACKAGING_RESTAURANT_SATISFACTED]} - ${option.key}`,
      }));
    }
  }, [isPackagingSatifactedSelected, values]);

  const parsedRestaurantByDayOptions = useMemo(
    () =>
      restaurantsByDay.map(
        ({ restaurantId, restaurantName, timestamp }: any) => ({
          key: `${restaurantId} - ${timestamp}`,
          label: `${restaurantName} - ${format(
            new Date(timestamp),
            'dd/MM/yyyy',
          )}`,
        }),
      ),
    [JSON.stringify(restaurantsByDay)],
  );

  const optionalPackagingRating = isPackagingSatifactedSelected ? (
    <>
      <div className={css.optionalFieldTitle}>
        Yếu tố nào khiến bạn hài lòng?
      </div>
      <FieldDropdownSelect
        name="optionalPackaging-restaurant-satifacted"
        id="optionalPackaging-restaurant"
        className={css.optionalSelectField}
        placeholder="Chọn nhà hàng bạn muốn đánh giá"
        options={parsedRestaurantByDayOptions}
      />
      {isPackagingRestaurantSelected && (
        <FieldLabelCheckbox
          name="optionalPackaging-satifacted"
          options={optionalSatifactedPackagingRatingOptions || []}
          containerClassName={css.optionalFieldContainer}
        />
      )}
    </>
  ) : (
    <>
      <div className={css.optionalFieldTitle}>
        Yếu tố nào khiến bạn không hài lòng?
      </div>
      <FieldDropdownSelect
        name="optionalPackaging-restaurant-unsatifacted"
        id="optionalPackaging-restaurant"
        className={css.optionalSelectField}
        placeholder="Chọn nhà hàng bạn muốn đánh giá"
        options={parsedRestaurantByDayOptions}
      />

      {isPackagingRestaurantSelected && (
        <FieldLabelCheckbox
          name="optionalPackaging-unsatifacted"
          options={optionalUnsatifactedPackagingRatingOptions || []}
          containerClassName={css.optionalFieldContainer}
        />
      )}
    </>
  );

  const optionalPackagingOtherFieldId = `optionalPackaging-other - ${
    isPackagingSatifactedSelected
      ? values?.[OPTIONAL_PACKAGING_RESTAURANT_SATISFACTED]
      : values?.[OPTIONAL_PACKAGING_RESTAURANT_UNSATISFACTED]
  }`;

  const shouldRenderOptionalPackagingOtherField = isPackagingSatifactedSelected
    ? (values?.['optionalPackaging-satifacted'] || []).findIndex(
        (item: string) =>
          item ===
          `${values?.[OPTIONAL_PACKAGING_RESTAURANT_SATISFACTED]} - other`,
      ) !== -1
    : (values?.['optionalPackaging-unsatifacted'] || []).findIndex(
        (item: string) =>
          item ===
          `${values?.[OPTIONAL_PACKAGING_RESTAURANT_UNSATISFACTED]} - other`,
      ) !== -1;

  const optionalPackagingOtherField =
    shouldRenderOptionalPackagingOtherField && (
      <div className={css.optionalOtherField}>
        <FieldTextArea
          id={optionalPackagingOtherFieldId}
          name={optionalPackagingOtherFieldId}
        />
      </div>
    );

  return (
    <>
      <div className={css.detailRatingMainField}>
        <div className={css.detailRatingTitle}>Dụng cụ</div>
        <FieldRating
          name="packaging"
          containerClassName={css.fieldContainer}
          iconClassName={css.faceIcon}
          titleShowed={isShowTitle}
        />
      </div>
      {isPackagingSelected && (
        <>
          <div className={css.detailRatingOptionalField}>
            {optionalPackagingRating}
          </div>
          {optionalPackagingOtherField}
        </>
      )}
    </>
  );
};

export default PackagingRating;
