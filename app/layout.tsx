import type { Metadata } from "next";
import { Ubuntu_Sans, Ubuntu_Sans_Mono } from "next/font/google";
import "./globals.css";
import { ChakraProvider } from '@chakra-ui/react';

const ubuntuSans = Ubuntu_Sans({
  variable: "--font-ubuntu-sans",
  subsets: ["latin"],
});

const ubuntuMono = Ubuntu_Sans_Mono({
  variable: "--font-ubuntu-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IPPT Calculator",
  description: "The most modern IPPT calculator to date in 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ubuntuSans.className} ${ubuntuMono.className} antialiased`}
      >
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
