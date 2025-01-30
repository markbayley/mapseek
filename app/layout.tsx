// app/layout.tsx
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
