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
          rel="apple-touch-icon"
          sizes="180x180"
          href="/static/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/static/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/static/icons/favicon-16x16.png"
        />
        <link rel="manifest" href="/static/icons/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/static/icons/safari-pinned-tab.svg"
          color="#EF3D2A"
        />
        <link rel="shortcut icon" href="/static/icons/favicon.ico" />
        <meta name="msapplication-TileColor" content="#fff" />
        <meta
          name="msapplication-TileImage"
          content="/static/icons/mstile-144x144.png"
        />
        <meta
          name="msapplication-config"
          content="/static/icons/browserconfig.xml"></meta>
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
        <script id="gn" src={'@src/assets/GoNativeJSBridgeLibrary'} />
      </Head>
      <body>
        <Main />
        <div id="redDot" style={{ position: 'fixed', zIndex: 1000000 }}></div>
        <NextScript />
      </body>
    </Html>
  );
}
