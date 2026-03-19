"use client";
import { SessionProvider } from "next-auth/react";
import { Cascadia_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const cascadiaMono = Cascadia_Mono({ subsets: ["latin"] });

const roboto = Roboto({ subsets: ["latin"] });



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>HandyHub</title>
        <meta
          name="description"
          content="HandyHub connects you with trusted home service providers for all your household needs."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${cascadiaMono.className} ${roboto.className} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
