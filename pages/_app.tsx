import '../app/globals.css';
import type { AppProps } from 'next/app';
import { UserProvider } from '../components/UserContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}