import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Padion",
  description: "Live Scores, Predictions & Padel News",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="dark">
      <body className="min-h-screen bg-background text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
