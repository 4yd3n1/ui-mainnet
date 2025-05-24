import '../styles/globals.css';
import dynamic from 'next/dynamic';
import WinnerPopupClient from './components/WinnerPopupClient';
import { Toaster } from 'react-hot-toast';

const Providers = dynamic(() => import('./providers').then(mod => mod.Providers), { ssr: false });

export const metadata = {
  title: 'Make Ethereum Great Again',
  description: 'Join the ultimate on-chain rally! Connect your wallet to participate in the race to $10M market cap.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      </head>
      <body className="bg-[#10182A] text-white min-h-screen font-press">
        <Providers>
          {children}
          <WinnerPopupClient />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}