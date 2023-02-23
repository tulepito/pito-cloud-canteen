import { useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import QuizModal from '../components/QuizModal/QuizModal';
import css from './QuizSpecialDemand.module.scss';
import type { TSpecialDemandFormValues } from './SpecialDemandForm/SpecialDemandForm';
import SpecialDemandForm from './SpecialDemandForm/SpecialDemandForm';

const QuizSpecialDemand = () => {
  const intl = useIntl();
  const formSubmitRef = useRef<any>();
  const [formValues, setFormValues] = useState<TSpecialDemandFormValues>();

  const submitDisabled = useMemo(() => {
    return !formValues?.nutritions?.length;
  }, [formValues?.nutritions]);

  const onClickSubmitButton = () => {
    formSubmitRef?.current.submit();
  };
  const onFormSubmit = (values: TSpecialDemandFormValues) => {
    console.log('values: ', values);
  };

  const initialValues: TSpecialDemandFormValues = useMemo(
    () => ({
      nutritions: [],
    }),
    [],
  );
  return (
    <QuizModal
      isOpen
      handleClose={() => {}}
      modalTitle={intl.formatMessage({
        id: 'QuizPerPackMemberAmountPage.title',
      })}
      submitText="Tiếp tục"
      cancelText="Bỏ qua"
      onCancel={() => {}}
      onSubmit={onClickSubmitButton}
      submitDisabled={submitDisabled}
      onBack={() => {}}>
      <div className={css.formContainer}>
        <SpecialDemandForm
          onSubmit={onFormSubmit}
          formRef={formSubmitRef}
          initialValues={initialValues}
          setFormValues={setFormValues}
        />
      </div>
    </QuizModal>
  );
};

export default QuizSpecialDemand;
