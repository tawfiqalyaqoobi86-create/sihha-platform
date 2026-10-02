import "./globals.css";

export const metadata = {
  title: "صِحّة | التقييم الذاتي",
  description: "منصة عمر بن مسعود للمدارس المعززة للصحة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}