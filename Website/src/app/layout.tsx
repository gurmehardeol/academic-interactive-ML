import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Academic Interactive — The Digital Atheneum",
  description:
    "Explore statistical concepts and algorithmic foundations through immersive interactive visualizations designed for clarity and depth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-body antialiased">
        {children}
      </body>
    </html>
  );
}
