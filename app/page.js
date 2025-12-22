// app/page.js
import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";

// Komponen-komponen UI (Tetap sama)
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import ProductsSection from "../components/ProductsSection";
import WhyUsSection from "../components/WhyUsSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

// CSS Styles (Tetap dipertahankan)
const customStyles = `
  @keyframes fade-in-up {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-enter {
    animation: fade-in-up 0.8s ease-out forwards;
  }
  .bg-grid-pattern {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  }
`;

export default async function Home() {
  const featuredProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(3);

  return (
    <>
      {/* Menggunakan tag style biasa agar kompatibel dengan Server Component */}
      <style>{customStyles}</style>

      <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans relative overflow-x-hidden">
        {/* Background Decorative Layer (Desain Asli Anda) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.6]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-200/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <Navbar />

        <main className="relative z-10 flex flex-col gap-0">
          <HeroSection />
          <FeaturesSection />

          <ProductsSection products={featuredProducts} isLoading={false} />

          <WhyUsSection />
          <CTASection />
        </main>

        <div className="relative z-10">
          <Footer />
        </div>
      </div>
    </>
  );
}