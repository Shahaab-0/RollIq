import type { Metadata } from 'next';
import { Oswald, JetBrains_Mono } from 'next/font/google';
import QueryProvider from '@/components/QueryProvider';
import ToastHost from '@/components/ToastHost';
import './globals.css';

// Power theme: Oswald (condensed, heavy-weight) as the primary/display face
// so headings and body copy both read big and bold; JetBrains Mono for
// every tabular-nums number column already in use across the app.
const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'RollIQ',
  description: 'Track your Brazilian Jiu-Jitsu training, techniques, and progress.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${oswald.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <QueryProvider>
          {children}
          <ToastHost />
        </QueryProvider>
      </body>
    </html>
  );
}
