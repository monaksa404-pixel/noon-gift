const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-project.vercel.app";
const title =
  "noon Online Shopping KSA - Electronics, Mobiles, Fashion, Appliances & More";
const description =
  "Shop online from noon KSA - your one-stop shop for mobiles, electronics, fashion, beauty, groceries & more.";
const image = `${siteUrl}/og-image.jpg?v=2`;

export default function Head() {
  return (
    <>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
