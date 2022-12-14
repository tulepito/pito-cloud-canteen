import Button from '@components/Button/Button';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import { required } from '@utils/validators';
import { Form as FinalForm } from 'react-final-form';

const StyleGuidePage = (props: any) => {
  const onSubmitHandler = (values: object) => {
    console.log({ values });
  };
  return (
    <FinalForm
      {...props}
      onSubmit={onSubmitHandler}
      render={(fieldRenderProps) => {
        const { handleSubmit } = fieldRenderProps;
        const requiredMessage = required('Vui lòng nhập trường dữ liệu');

        return (
          <Form onSubmit={handleSubmit}>
            <FieldTextInput
              id={`username`}
              name="username"
              validate={requiredMessage}
              fullWidth={false}
            />
            <FieldTextInput
              id={`email`}
              name="email"
              validate={requiredMessage}
              placeholder="hello"
              fullWidth={false}
            />
            <Button type="submit" buttonSize="large">
              Submit
            </Button>
          </Form>
        );
      }}
    />
  );
};

export default StyleGuidePage;
