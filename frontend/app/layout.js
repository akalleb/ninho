import React from 'react';
import { Providers } from './providers';
import PreventFOUC from './components/PreventFOUC';
// Import CSS files - Next.js will automatically add them to the head
// These imports ensure CSS is loaded before component rendering
import './critical.css'; // Critical CSS for FOUC prevention
import '../src/static/css/style.css';
import 'antd/dist/reset.css';

export const metadata = {
  title: 'Ninho Social',
  description: 'Ninho Social - Plataforma de Gestão de Cuidados e Assistência',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* External stylesheets - loaded first for proper cascade */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/jvectormap/2.0.4/jquery-jvectormap.css"
          type="text/css"
          media="screen"
        />
      </head>
      <body suppressHydrationWarning>
        <PreventFOUC />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
