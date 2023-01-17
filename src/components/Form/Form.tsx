import type { FormHTMLAttributes, PropsWithChildren } from 'react';

type FormProps = PropsWithChildren<
  FormHTMLAttributes<HTMLFormElement> & {
    contentRef?: any;
  }
>;

const Form: React.FC<FormProps> = (props) => {
  const { children, contentRef, ...rest } = props;

  const formProps = {
    // These are mainly default values for the server
    // rendering. Otherwise the form would submit potentially
    // sensitive data with the default GET method until the client
    // side code is loaded.
    method: 'post',
    action: '/',

    // allow content ref function to be passed to the form
    ref: contentRef,
    ...rest,
  };

  return <form {...formProps}>{children}</form>;
};

export default Form;
