import { addCompanyName } from '@reducer/company';
import { useAppDispatch } from '@src/reduxHooks';
import type { FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';

const InforSetupScreen = () => {
  const dispatch = useAppDispatch();
  const onSubmit = (values: any) => {
    dispatch(addCompanyName(values.companyName));
  };
  return (
    <>
      <FinalForm
        onSubmit={onSubmit}
        render={(formRenderProps: FormRenderProps) => {
          const { handleSubmit } = formRenderProps;
          return (
            <form onSubmit={handleSubmit}>
              <Field name="companyName" component="input" />
              <input type="submit" />
            </form>
          );
        }}
      />
    </>
  );
};
export default InforSetupScreen;
