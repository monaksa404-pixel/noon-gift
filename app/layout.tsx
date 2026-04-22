// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-project.vercel.app";
const shareTitle =
  "noon Online Shopping KSA - Electronics, Mobiles, Fashion, Appliances & More";
const shareDescription =
  "Shop online from noon KSA - your one-stop shop for mobiles, electronics, fashion, beauty, groceries & more.";
const shareImageUrl = `${siteUrl}/og-image.jpg?v=2`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: shareTitle,
  description: shareDescription,
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: siteUrl,
    siteName: "noon",
    images: [
      {
        url: shareImageUrl,
        width: 1200,
        height: 630,
        alt: "noon KSA preview image",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: [shareImageUrl],
  },
  icons: {
    icon: "/favicon.ico",
  },
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
