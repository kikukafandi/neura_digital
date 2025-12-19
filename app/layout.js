import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Neura Digital - Solusi Digital Produktif untuk Kreator",
  description: "Membangun ekosistem digital yang lebih bersih, terstruktur, dan produktif untuk kreator Indonesia.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
            },
            success: {
              style: { background: '#DEF7EC', color: '#03543F', border: '1px solid #84E1BC' },
            },
            error: {
              style: { background: '#FDE8E8', color: '#9B1C1C', border: '1px solid #F8B4B4' },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
