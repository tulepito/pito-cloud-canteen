import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import { required } from '@utils/validators';
import { Form as FinalForm } from 'react-final-form';

const StyleGuidePage = (props: any) => {
  const onSubmitHandler = (values: any) => {
    console.log({ values });
  };
  return (
    <FinalForm
      {...props}
      onSubmit={onSubmitHandler}
      render={(fieldRenderProps) => {
        const { handleSubmit } = fieldRenderProps;
        const requiredMessage = required('This field is required');

        return (
          <Form onSubmit={handleSubmit}>
            <FieldTextInput
              id={`username`}
              label="Username"
              name="username"
              validate={requiredMessage}
            />
            <FieldTextInput
              id={`email`}
              label="Email"
              name="email"
              validate={requiredMessage}
            />

            <button type="submit">Submit</button>
          </Form>
        );
      }}
    />
  );
};

export default StyleGuidePage;
