import FieldLabelCheckbox from '@components/FormFields/FieldLabelCheckbox/FieldLabelCheckbox';
import FieldRating from '@components/FormFields/FieldRating/FieldRating';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';

import css from './OrderRatingForm.module.scss';

type TServiceRatingProps = {
  values: any;
  isShowTitle?: boolean;
};

const ServiceRating: React.FC<TServiceRatingProps> = (props) => {
  const { values, isShowTitle } = props;
  const isServiceSelected = values?.service;
  const isServiceSatifactedSelected = values?.service && values?.service >= 3;
  const isOptionalOtherServiceRatingSelected =
    values?.service &&
    (values?.['optionalService-satifacted']?.includes('other') ||
      values?.['optionalService-unsatifacted']?.includes('other'));

  const optionalUnsatifactedServiceRatingOptions = [
    {
      key: 'slow-app',
      label: 'App chậm',
    },
    {
      key: 'unfriendly-app',
      label: 'App khó sử dụng',
    },
    {
      key: 'unprofessional-setup',
      label: 'Set up không chuyên nghiệp',
    },
    {
      key: 'not-good-format',
      label: 'Hình thức không đẹp',
    },
    {
      key: 'other',
      label: 'Khác',
    },
  ];
  const optionalSatifactedServiceRatingOptions = [
    {
      key: 'friendly-app',
      label: 'App dễ thao tác',
    },
    {
      key: 'professional-setup',
      label: 'Set up chuyên nghiệp',
    },
    {
      key: 'good-service',
      label: 'Dịch vụ chu đáo',
    },
    {
      key: 'good-format',
      label: 'Hình thức sạch đẹp',
    },
    {
      key: 'other',
      label: 'Khác',
    },
  ];

  const optionalServiceRating = isServiceSatifactedSelected ? (
    <>
      <div className={css.optionalFieldTitle}>
        Bạn hài lòng yếu tố nào ở dịch vụ?
      </div>
      <FieldLabelCheckbox
        name="optionalService-satifacted"
        options={optionalSatifactedServiceRatingOptions}
        containerClassName={css.optionalFieldContainer}
      />
    </>
  ) : (
    <>
      <div className={css.optionalFieldTitle}>
        Bạn không hài lòng yếu tố nào ở dịch vụ?
      </div>
      <FieldLabelCheckbox
        name="optionalService-unsatifacted"
        options={optionalUnsatifactedServiceRatingOptions}
        containerClassName={css.optionalFieldContainer}
      />
    </>
  );

  const optionalServiceOtherField = isOptionalOtherServiceRatingSelected && (
    <div className={css.optionalOtherField}>
      <FieldTextArea id="optionalService-other" name="optionalService-other" />
    </div>
  );

  return (
    <>
      <div className={css.detailRatingMainField}>
        <div className={css.detailRatingTitle}>Dịch vụ</div>
        <FieldRating
          name="service"
          containerClassName={css.fieldContainer}
          iconClassName={css.faceIcon}
          titleShowed={isShowTitle}
        />
      </div>
      {isServiceSelected && (
        <>
          <div className={css.detailRatingOptionalField}>
            {optionalServiceRating}
          </div>
          {optionalServiceOtherField}
        </>
      )}
    </>
  );
};

export default ServiceRating;
