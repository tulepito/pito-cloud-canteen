import { useMemo } from 'react';

import FieldLabelCheckbox from '@components/FormFields/FieldLabelCheckbox/FieldLabelCheckbox';
import FieldRating from '@components/FormFields/FieldRating/FieldRating';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';

import css from './OrderRatingForm.module.scss';

type TPackagingRatingProps = {
  values: any;
  restaurantsByDay: any;
};
const PackagingRating: React.FC<TPackagingRatingProps> = (props) => {
  const { values, restaurantsByDay } = props;
  const isPackagingSelected = values?.packaging;
  const isPackagingSatifactedSelected =
    values?.packaging && values?.packaging >= 3;
  const isPackagingRestaurantSelected =
    values?.['optionalPackaging-restaurant-satifacted'] ||
    values?.['optionalPackaging-restaurant-unsatifacted'];

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
      values?.['optionalPackaging-restaurant-unsatifacted']
    ) {
      return basicOptionalUnsatifactedPackagingRatingOptions.map((option) => ({
        ...option,
        key: `${values?.['optionalPackaging-restaurant-unsatifacted']} - ${option.key}`,
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
      values?.['optionalPackaging-restaurant-satifacted']
    ) {
      return basicOptionalSatifactedPackagingRatingOptions.map((option) => ({
        ...option,
        key: `${values?.['optionalPackaging-restaurant-satifacted']} - ${option.key}`,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPackagingSatifactedSelected, values]);

  const optionalPackagingRating = isPackagingSatifactedSelected ? (
    <>
      <div className={css.optionalFieldTitle}>
        Yếu tố nào khiến bạn hài lòng?
      </div>
      <FieldSelect
        name="optionalPackaging-restaurant-satifacted"
        id="optionalPackaging-restaurant"
        className={css.optionalSelectField}>
        <option value="">Chọn nhà hàng bạn muốn đánh giá</option>
        {restaurantsByDay.map(
          ({ restaurantId, restaurantName, timestamp }: any) => (
            <option
              key={`${restaurantId}-${timestamp}`}
              value={`${restaurantId} - ${timestamp}`}>
              {restaurantName}
            </option>
          ),
        )}
      </FieldSelect>
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
      <FieldSelect
        name="optionalPackaging-restaurant-unsatifacted"
        id="optionalPackaging-restaurant"
        className={css.optionalSelectField}>
        <option value="">Chọn nhà hàng bạn muốn đánh giá</option>
        {restaurantsByDay.map(
          ({ restaurantId, restaurantName, timestamp }: any) => (
            <option
              key={`${restaurantId}-${timestamp}`}
              value={`${restaurantId} - ${timestamp}`}>
              {restaurantName}
            </option>
          ),
        )}
      </FieldSelect>
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
      ? values?.['optionalPackaging-restaurant-satifacted']
      : values?.['optionalPackaging-restaurant-unsatifacted']
  }`;

  const shouldRenderOptionalPackagingOtherField = isPackagingSatifactedSelected
    ? (values?.['optionalPackaging-satifacted'] || []).findIndex(
        (item: string) =>
          item ===
          `${values?.['optionalPackaging-restaurant-satifacted']} - other`,
      ) !== -1
    : (values?.['optionalPackaging-unsatifacted'] || []).findIndex(
        (item: string) =>
          item ===
          `${values?.['optionalPackaging-restaurant-unsatifacted']} - other`,
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
