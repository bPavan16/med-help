import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-display'
});
const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-serif'
});

export const metadata: Metadata = {
  title: 'Med-Help - Your AI Medicine Information Assistant',
  description: 'Search for any medicine and get instant information with detailed usage instructions using AI.',
  keywords: ['medicine information', 'med-help', 'medicine search', 'healthcare assistant', 'drug information', 'AI medicine search'],
  authors: [{ name: 'Med-Help Team' }],
  openGraph: {
    title: 'Med-Help - Your AI Medicine Information Assistant',
    description: 'Instantly search for medicines and get detailed usage instructions with our AI-powered assistant.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Med-Help',
    description: 'AI-powered medicine information and usage guide',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${lora.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
