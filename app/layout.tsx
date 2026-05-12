import type { Metadata } from "next";
import "./globals.css"; // Optional: only if you have a css file

export const metadata: Metadata = {
  title: "Intel Portal",
  description: "Developed by @exupureborn",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

