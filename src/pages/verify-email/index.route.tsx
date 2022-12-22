import EmailVerificationPage from './components/EmailVerification.page';

const EmailVerificationRoute = () => {
  return <EmailVerificationPage />;
};

EmailVerificationRoute.requireAuth = true;

export default EmailVerificationRoute;
