import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LayoutClient from "./LayoutClient";
import React from "react";

const kinetikaLight = localFont({
  src: "../../public/fonts/KinetikaLight.otf",
  variable: "--font-kinetika-light",
});

const kinetikaUltra = localFont({
  src: "../../public/fonts/KinetikaUltra.otf",
  variable: "--font-kinetika-ultra",
});

export const metadata: Metadata = {
  title: "HACKX 4.0 Dashboard",
  description: "MUJ's Hackathon Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${kinetikaLight.variable} ${kinetikaUltra.variable} font-sans antialiased`}
      >
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
