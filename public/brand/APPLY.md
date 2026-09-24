# Apply the XIV logo to marcelozapata.dev

1. Copy everything in `public/` into the site's static folder (`public/` in Next.js, site root in plain HTML).
   Delete the old `favicon.ico`, `apple-touch-icon.png`, `icon*.png`, `og-image.png` first (or overwrite).

## Next.js App Router — src/app/layout.tsx (or app/layout.tsx)
```tsx
export const metadata = {
  // ...keep your existing title/description
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: { images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
};
```
If the repo has `src/app/favicon.ico` or `src/app/icon.png`, delete/replace those; they override `metadata.icons`.

## Plain HTML / Pages router — inside <head>
```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:image" content="https://www.marcelozapata.dev/og-image.png">
<meta name="twitter:card" content="summary_large_image">
```

## Header logo (transparent PNG, cream on any dark background)
```tsx
<img src="/xiv-mark.png" alt="XIV" height={28} style={{height:28,width:"auto"}} />
```
Use `xiv-capital-logo.png` only where the full lockup fits (hero/footer). The 28px header size should use the mark alone; "CAPITAL" is unreadable that small.

## PWA manifest (if the site has one)
icons: /icon-192.png (192x192), /icon-512.png (512x512)

## Check
Hard-refresh; favicons cache hard. Test in a private window.
