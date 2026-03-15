import './globals.css';
import Header from '../components/Header';

export const metadata = {
  title: 'Portal Pracy',
  description: 'Prosty portal pracy',
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