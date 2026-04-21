// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-project.vercel.app";
const shareTitle = "Dash Cameras Oman | Best Price Offers | Muscat, Seeb";
const shareDescription =
  "Biggest selection of Dash Cameras in Oman ✓ Secure Shopping ✓ Top Brands ✓ Hassle-free Delivery ✓ Free Shipping. Shop Now!";
const shareImageUrl = `${siteUrl}/api/og-image`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: shareTitle,
  description: shareDescription,
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: "/",
    siteName: "noon",
    images: [
      {
        url: shareImageUrl,
        width: 310,
        height: 163,
        alt: "Dash Cameras Oman ad preview",
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
