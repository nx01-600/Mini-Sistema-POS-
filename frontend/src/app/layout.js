import "./globals.css";

export const metadata = {
  title: "Mini POS",
  description: "Proyecto con Next.js + Firebase + Tailwind",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
