import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PITAYA UPLOADER",
  description: "Catalog your vinyl record collection",
  manifest: "/manifest.json",
  other: {
    "theme-color": "#3b82f6",
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>
        {children}
        {/* Script para suprimir erros de hidratação */}
        <Script id="suppress-hydration-warnings" strategy="afterInteractive">
          {`
            (function() {
              const originalError = console.error;
              console.error = function() {
                if (
                  typeof arguments[0] === 'string' && 
                  (arguments[0].includes('Warning: Text content did not match') ||
                  arguments[0].includes('Warning: Prop') && arguments[0].includes('did not match') ||
                  arguments[0].includes('A tree hydrated but some attributes'))
                ) {
                  // Ignora erros de hidratação específicos
                  return;
                }
                originalError.apply(console, arguments);
              };
            })();
          `}
        </Script>
        
        {/* Script para verificar permissões de câmera */}
        <Script id="check-camera-permissions" strategy="afterInteractive">
          {`
            (function() {
              // Verificar se o navegador suporta a API de permissões
              if (navigator.permissions && navigator.permissions.query) {
                // Verificar o status da permissão de câmera
                navigator.permissions.query({ name: 'camera' })
                  .then(function(permissionStatus) {
                    console.log('Camera permission status:', permissionStatus.state);
                    
                    // Se a permissão estiver negada, mostrar uma mensagem
                    if (permissionStatus.state === 'denied') {
                      console.warn('Camera access is denied. Please enable it in your browser settings.');
                    }
                  })
                  .catch(function(error) {
                    console.log('Error checking camera permission:', error);
                  });
              }
              
              // Verificar se o navegador suporta a API MediaDevices
              if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('This browser does not support the MediaDevices API');
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
