import { Provider } from 'react-redux';
import { parse } from 'cookie';
import type { AppContext, AppProps } from 'next/app';
import App from 'next/app';
import Head from 'next/head';
import { Router } from 'next/router';
import Script from 'next/script';
import nProgress from 'nprogress';

import AuthGuard from '@components/Guards/AuthGuard';
import GoNativeProvider from '@components/Guards/GoNativeProvider';
import PermissionGuard from '@components/Guards/PermissionGuard';
import { LoadingContainerImagePreloader } from '@components/LoadingContainer/LoadingContainer';
import ToastifyProvider from '@components/ToastifyProvider/ToastifyProvider';
import UIProvider from '@components/UIProvider/UIProvider';
import store from '@redux/store';
import { publicPaths } from '@src/paths';
import TranslationProvider, {
  DEFAULT_LOCALE,
} from '@translations/TranslationProvider';
import type { NextApplicationPage } from '@utils/types';

import '@src/styles/globals.scss';
import '@src/styles/gleap.scss';
import '@src/styles/nprogress.scss';
import 'react-loading-skeleton/dist/skeleton.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

Router.events.on('routeChangeStart', nProgress.start);
Router.events.on('routeChangeError', nProgress.done);
Router.events.on('routeChangeComplete', nProgress.done);

type AppCustomProps = {
  isAuthenticated: boolean;
  authInfoLoaded: boolean;
  Component?: NextApplicationPage;
};

const MyApp = ({
  Component,
  router,
  ...restProps
}: AppProps & AppCustomProps) => {
  const { pathname } = router;

  const isPagePublic = publicPaths.some((path) => pathname.startsWith(path));

  return (
    <TranslationProvider lang={restProps.pageProps.lang}>
      <Provider store={store}>
        <UIProvider>
          {isPagePublic ? (
            <ToastifyProvider>
              <GoNativeProvider>
                {/* common app head tag */}
                <Head>
                  <meta
                    name="viewport"
                    content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi"
                  />
                </Head>
                <Component {...restProps.pageProps} key={router.asPath} />
              </GoNativeProvider>
            </ToastifyProvider>
          ) : (
            <AuthGuard>
              <PermissionGuard>
                <ToastifyProvider>
                  <GoNativeProvider>
                    {/* common app head tag */}
                    <Head>
                      <meta
                        name="viewport"
                        content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi"
                      />
                    </Head>
                    <Component {...restProps.pageProps} key={router.asPath} />
                  </GoNativeProvider>
                </ToastifyProvider>
              </PermissionGuard>
            </AuthGuard>
          )}
        </UIProvider>
      </Provider>
      <LoadingContainerImagePreloader />
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=Function.prototype`}
      />
      <Script id="gleap-script">
        {`!function(Gleap,t,i){if(!(Gleap=window.Gleap=window.Gleap||[]).invoked){for(window.GleapActions=[],Gleap.invoked=!0,Gleap.methods=["identify","setEnvironment","setTags","attachCustomData","setCustomData","removeCustomData","clearCustomData","registerCustomAction","trackEvent","log","preFillForm","showSurvey","sendSilentCrashReport","startFeedbackFlow","startBot","setAppBuildNumber","setAppVersionCode","setApiUrl","setFrameUrl","isOpened","open","close","on","setLanguage","setOfflineMode","initialize","disableConsoleLogOverwrite","logEvent","hide","enableShortcuts","showFeedbackButton","destroy","getIdentity","isUserIdentified","clearIdentity","openConversations","openConversation","openHelpCenterCollection","openHelpCenterArticle","openHelpCenter","searchHelpCenter","openNewsArticle","openNews","openFeatureRequests","isLiveMode"],Gleap.f=function(e){return function(){var t=Array.prototype.slice.call(arguments);window.GleapActions.push({e:e,a:t})}},t=0;t<Gleap.methods.length;t++)Gleap[i=Gleap.methods[t]]=Gleap.f(i);Gleap.load=function(){var t=document.getElementsByTagName("head")[0],i=document.createElement("script");i.type="text/javascript",i.async=!0,i.src="https://sdk.gleap.io/latest/index.js",t.appendChild(i)},Gleap.load(),Gleap.setLanguage("vi-VN"),Gleap.initialize("${process.env.NEXT_PUBLIC_GLEAP_SDK_KEY}"),Gleap.on("initialized",() =>{Gleap.hide()})}}();`}
      </Script>

      {process.env.NEXT_PUBLIC_ENV === 'production' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
        `}
          </Script>
        </>
      )}
    </TranslationProvider>
  );
};

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  const req = appContext.ctx.req;
  const cookies = req ? parse(req.headers.cookie || '') : {};
  const lang = cookies.lang || DEFAULT_LOCALE;

  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      lang,
    },
  };
};

export default MyApp;
