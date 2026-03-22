import './globals.css';
import Header from '../components/Header';

export const metadata = {
  title: 'Job Portal - Portal Pracy',
  description: 'Prosty portal pracy',
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-gray-50">
        <Header />
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}