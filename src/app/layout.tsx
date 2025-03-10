import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vinyl Record Cataloging App",
  description: "Catalog your vinyl record collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
