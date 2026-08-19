import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gati-Sanchalan DSS — Ministry of Railways, Government of India',
  description: 'AI-Powered Train Traffic Controller & Dynamic Section Throughput System (SIH25022 Ministry of Railways)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
