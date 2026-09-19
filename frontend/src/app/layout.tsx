import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iris Flower Classification",
  description:
    "A machine learning web application for Iris flower classification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}