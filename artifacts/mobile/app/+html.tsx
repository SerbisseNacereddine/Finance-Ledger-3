import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1A237E" />

        <meta name="application-name" content="Money Manager" />
        <meta name="description" content="Track income, expenses, debt, and lent money" />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Money Manager" />

        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="icon" type="image/png" href="/icon.png" />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{
          __html: `
            html, body, #root { height: 100%; }
            body { overflow: hidden; }
          `
        }} />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function (reg) {
                      console.log('[SW] Registered:', reg.scope);
                    })
                    .catch(function (err) {
                      console.warn('[SW] Registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
