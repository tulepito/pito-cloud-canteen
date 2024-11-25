import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldPasswordInput from '@components/FormFields/FieldPasswordInput/FieldPasswordInput';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconGoogle from '@components/Icons/IconGoogle/IconGoogle';
import IconSecure from '@components/Icons/IconSecure/IconSecure';
import PitoLogoV2 from '@components/PitoLogoV2/PitoLogoV2';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { generalPaths } from '@src/paths';
import type { TDefaultProps } from '@utils/types';
import {
  composeValidators,
  emailFormatValid,
  passwordFormatValid,
  required,
} from '@utils/validators';

import config from '../../../configs';

import css from './SignInForm.module.scss';

export type TSignInFormValues = {
  email: string;
  password: string;
};

type TExtraProps = TDefaultProps & {
  errorMessage?: ReactNode;
  inProgress: boolean;
};
type TSignInFormComponentProps = FormRenderProps<TSignInFormValues> &
  Partial<TExtraProps>;
type TSignInFormProps = FormProps<TSignInFormValues> & TExtraProps;

const SignInFormComponent: React.FC<TSignInFormComponentProps> = (props) => {
  const intl = useIntl();
  const router = useRouter();

  const { query } = router;
  const {
    rootClassName,
    className,
    errorMessage,
    handleSubmit,
    invalid,
    submitting,
    inProgress,
  } = props;
  const submitDisable = invalid || inProgress || submitting;
  const submitInprogress = inProgress || submitting;
  const classes = classNames(rootClassName || css.root, className);

  const shouldShowGoogleSignInBtn = !isEmpty(config.googleClientId);
  const shouldShowSocialLoginSection = shouldShowGoogleSignInBtn;

  const formTitle = intl.formatMessage({
    id: 'SignInForm.title',
  });
  const submitButtonText = intl.formatMessage({
    id: 'SignInForm.submitButtonText',
  });
  const forgotPasswordText = intl.formatMessage({
    id: 'SignInForm.forgotPassword',
  });
  const orText = intl.formatMessage({
    id: 'SignInForm.orText',
  });
  const googleLoginText = intl.formatMessage({
    id: 'SignInForm.googleLoginText',
  });
  const doNotHaveAnAccountText = intl.formatMessage({
    id: 'SignInForm.doNotHaveAnAccount',
  });
  const toSignUp = intl.formatMessage({
    id: 'SignInForm.toSignUp',
  });

  const fieldEmailProps = {
    id: 'SignInForm.email',
    name: 'email',
    placeholder: intl.formatMessage({
      id: 'SignInForm.email.placeholder',
    }),
    label: intl.formatMessage({
      id: 'SignInForm.email.label',
    }),
    validate: composeValidators(
      required(intl.formatMessage({ id: 'SignInForm.email.required' })),
      emailFormatValid(intl.formatMessage({ id: 'SignInForm.email.invalid' })),
    ),
    // leftIcon: <IconMail />,
  };
  const fieldPasswordProps = {
    id: 'SignInForm.password',
    name: 'password',
    placeholder: intl.formatMessage({
      id: 'SignInForm.password.placeholder',
    }),
    label: intl.formatMessage({
      id: 'SignInForm.password.label',
    }),
    validate: composeValidators(
      required(intl.formatMessage({ id: 'SignInForm.password.required' })),
      passwordFormatValid(
        intl.formatMessage({ id: 'SignInForm.password.invalid' }),
      ),
    ),
    // leftIcon: <IconLock />,
  };

  const navigateToSignUpPage = () => {
    router.push({ pathname: generalPaths.SignUp, query });
  };

  const navigateToPasswordRecoverPage = () => {
    router.push(generalPaths.RecoveryPassword);
  };

  return (
    <div className={css.signInFormWrapper}>
      <PitoLogoV2 />

      <Form className={classes} onSubmit={handleSubmit}>
        <div className={css.formContainer}>
          <div className={css.formContent}>
            <h2 className={css.formTitle}>{formTitle}</h2>

            <div className={css.inputWrapper}>
              <FieldTextInput
                trim
                {...fieldEmailProps}
                errorClass={css.errorClass}
              />
              <FieldPasswordInput
                {...fieldPasswordProps}
                errorClass={css.errorClass}
              />
            </div>

            <div className={css.forgotPassword}>
              <span onClick={navigateToPasswordRecoverPage}>
                {forgotPasswordText}
              </span>
            </div>

            {errorMessage && (
              <div className={css.errorSignIn}>{errorMessage}</div>
            )}

            <Button
              variant="primary"
              className={css.submitButton}
              type="submit"
              disabled={submitDisable}
              inProgress={submitInprogress}>
              {submitButtonText}
            </Button>

            <RenderWhen condition={shouldShowSocialLoginSection}>
              <div className={css.orText}>
                <span>{orText}</span>
              </div>
              <RenderWhen condition={shouldShowGoogleSignInBtn}>
                <Button
                  className={css.googleLoginButton}
                  type="button"
                  disabled>
                  <IconGoogle className={css.googleIcon} />
                  <span>{googleLoginText}</span>
                </Button>
              </RenderWhen>
            </RenderWhen>

            <div className={css.secureWrapper}>
              <IconSecure />
              <p className={css.secureText}>
                Đăng nhập an toàn - Thông tin của bạn được bảo mật HTTPS
              </p>
            </div>

            <div className={css.termsCenter}>
              <p className={css.termsWrapper}>
                Bằng cách tham gia, bạn đã đọc và đồng ý{' '}
                <a
                  className={css.terms}
                  href="https://pito.vn/cam-nang/dieu-khoan-chinh-sach/"
                  target="_blank"
                  rel="noreferrer">
                  Điều khoản dịch vụ và điều kiện sử dụng
                </a>{' '}
                của PITO.
              </p>
            </div>

            <div className={css.doNotHaveAnAccount}>
              <div>
                {doNotHaveAnAccountText}{' '}
                <span className={css.toSignUp} onClick={navigateToSignUpPage}>
                  {' '}
                  {toSignUp}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

const SignInForm: React.FC<TSignInFormProps> = (props) => {
  return <FinalForm {...props} component={SignInFormComponent} />;
};

export default SignInForm;
