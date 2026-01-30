import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Q-Score | Quango Inc",
  description: "Team points tracker for Quango Inc creative agency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
