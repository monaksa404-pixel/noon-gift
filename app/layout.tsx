// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ogImage from "@/images/img9.jpeg";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-project.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "noon Gift Verification",
  description:
    "Verify your gift with secure OTP authentication and fast noon delivery.",
  openGraph: {
    title: "noon Gift Verification",
    description:
      "Verify your gift with secure OTP authentication and fast noon delivery.",
    url: "/",
    siteName: "noon",
    images: [
      {
        url: ogImage.src,
        width: 310,
        height: 163,
        alt: "noon gift preview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "noon Gift Verification",
    description:
      "Verify your gift with secure OTP authentication and fast noon delivery.",
    images: [ogImage.src],
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
