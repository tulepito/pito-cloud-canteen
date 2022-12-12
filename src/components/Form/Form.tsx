import type { FormHTMLAttributes, ReactNode } from 'react';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode | ReactNode[];
  contentRef?: any;
}

const Form = (props: FormProps) => {
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
