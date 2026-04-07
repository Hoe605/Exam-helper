import { Navbar } from "./_components/home/Navbar";
import { Hero } from "./_components/home/Hero";
import { AgentEcosystem } from "./_components/home/AgentEcosystem";
import { KnowledgeMap } from "./_components/home/KnowledgeMap";
import { Diagnostics } from "./_components/home/Diagnostics";
import { Pricing } from "./_components/home/Pricing";
import { Footer } from "./_components/home/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-background text-brand-on-background selection:bg-brand-secondary-fixed selection:text-brand-on-secondary-fixed font-sans">
      <Navbar />
      <main className="pt-24">
        <Hero />
        <AgentEcosystem />
        <KnowledgeMap />
        <Diagnostics />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
