import FieldLabelCheckbox from '@components/FormFields/FieldLabelCheckbox/FieldLabelCheckbox';
import FieldRating from '@components/FormFields/FieldRating/FieldRating';

import css from './OrderRatingForm.module.scss';

type TStaffRatingProps = {
  values: any;
  isShowTitle?: boolean;
};
const StaffRating: React.FC<TStaffRatingProps> = (props) => {
  const { values, isShowTitle } = props;
  const isStaffSelected = values?.staff;
  const isStaffSatifactedSelected = values?.staff && values?.staff >= 3;

  const optionalStaffRatingOptions = [
    {
      key: 'shipper',
      label: 'Giao hàng',
    },
    {
      key: 'consultant',
      label: 'Tư vấn',
    },
    {
      key: 'supporter',
      label: 'Hỗ trợ vận đơn',
    },
  ];
  const optionalStaffRating = isStaffSatifactedSelected ? (
    <>
      <div className={css.optionalFieldTitle}>
        Nhân viên nào khiến bạn hài lòng?
      </div>
      <FieldLabelCheckbox
        name="optionalStaff-satifacted"
        options={optionalStaffRatingOptions}
        containerClassName={css.optionalFieldContainer}
      />
    </>
  ) : (
    <>
      <div className={css.optionalFieldTitle}>
        Nhân viên nào khiến bạn không hài lòng?
      </div>
      <FieldLabelCheckbox
        name="optionalStaff-unsatifacted"
        options={optionalStaffRatingOptions}
        containerClassName={css.optionalFieldContainer}
      />
    </>
  );

  return (
    <>
      <div className={css.detailRatingMainField}>
        <div className={css.detailRatingTitle}>Nhân viên</div>
        <FieldRating
          titleShowed={isShowTitle}
          name="staff"
          containerClassName={css.fieldContainer}
          iconClassName={css.faceIcon}
        />
      </div>
      {isStaffSelected && (
        <div className={css.detailRatingOptionalField}>
          {optionalStaffRating}
        </div>
      )}
    </>
  );
};

export default StaffRating;
