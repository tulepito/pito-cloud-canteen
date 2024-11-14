/* eslint-disable @next/next/no-sync-scripts */
import { Head, Html, Main, NextScript } from 'next/document';
/**
 * Use https://realfavicongenerator.net/ for generate favicon
 */
export default function Document() {
  return (
    <Html>
      <Head>
        <link
          rel="icon"
          type="image/png"
          href="/static/icons/favicon-96x96.png"
          sizes="96x96"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/static/icons/favicon.svg"
        />
        <link rel="shortcut icon" href="/static/icons/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/static/icons/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="PITO Cloud Canteen" />
        <link rel="manifest" href="/static/icons/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <div id="redDot" style={{ position: 'fixed', zIndex: 1000000 }}></div>
        <NextScript />
      </body>
    </Html>
  );
}
