import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
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

        return (
          <Form onSubmit={handleSubmit}>
            <FieldTextInput id={`username`} label="Username" name="username" />
            <FieldTextInput id={`email`} label="Email" name="email" />

            <button type="submit">Submit</button>
          </Form>
        );
      }}
    />
  );
};

export default StyleGuidePage;
