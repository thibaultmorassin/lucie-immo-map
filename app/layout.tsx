import { Toaster } from "@/components/ui/toast";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Lucie Immo Map - Trouvez votre bien immobilier",
  description:
    "Découvrez les biens immobiliers à vendre près de chez vous avec notre carte interactive. Ajoutez vos propres annonces et trouvez la propriété de vos rêves.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div vaul-drawer-wrapper="" className="bg-background">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
