import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Form from '@components/Form/Form';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';

export type TReviewNoteSectionFormValues = {
  orderNote: string;
};

type TExtraProps = {
  onSaveOrderNote?: (value: string) => void;
  disabled: boolean;
};
type TReviewNoteSectionFormComponentProps =
  FormRenderProps<TReviewNoteSectionFormValues> & Partial<TExtraProps>;
type TReviewNoteSectionFormProps = FormProps<TReviewNoteSectionFormValues> &
  TExtraProps;

const ReviewNoteSectionFormComponent: React.FC<
  TReviewNoteSectionFormComponentProps
> = (props) => {
  const { handleSubmit, onSaveOrderNote, disabled } = props;

  const handleSaveOrderNote = (e: any) => {
    const { value } = e.target;
    if (!value || !onSaveOrderNote) return;
    onSaveOrderNote(value as string);
  };

  const intl = useIntl();

  return (
    <Form onSubmit={handleSubmit}>
      <>
        <FieldTextArea
          id="orderNote"
          name="orderNote"
          disabled={disabled}
          placeholder={intl.formatMessage({ id: 'nhap-ghi-chu-cho-don-hang' })}
          onBlur={handleSaveOrderNote}
        />
      </>
    </Form>
  );
};

const ReviewNoteSectionForm: React.FC<TReviewNoteSectionFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={ReviewNoteSectionFormComponent} />;
};

export default ReviewNoteSectionForm;
