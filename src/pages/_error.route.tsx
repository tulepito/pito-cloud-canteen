import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import type { NextPage } from 'next';
import type { ErrorProps } from 'next/error';
import Error from 'next/error';

import { enGeneralPaths } from '@src/paths';

const CustomErrorComponent: NextPage<ErrorProps> = (props) => {
  /**
   * When the error page is rendered, redirect to auth page
   */
  useEffect(() => {
    window.location.href = enGeneralPaths.auth.index;
  }, []);

  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData);

  // This will contain the status code of the response
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
