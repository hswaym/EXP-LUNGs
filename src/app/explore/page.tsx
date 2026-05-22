"use client";

import { useReducedMotion } from "framer-motion";
import SequenceCanvas from "@/components/SequenceCanvas";
import { TitleH1, HeadingH2, BodyText, MetaLabel } from "@/components/Typography";

// Interactive Components
import BreathingParticles from "@/components/interactive/BreathingParticles";
import FloatingStatCard from "@/components/interactive/FloatingStatCard";
import BronchialDiagram from "@/components/interactive/BronchialDiagram";
import CirculatoryFlow from "@/components/interactive/CirculatoryFlow";
import DiseaseCarousel from "@/components/interactive/DiseaseCarousel";
import WorldDiseaseMap from "@/components/interactive/WorldDiseaseMap";
import SpirometrySimulator from "@/components/interactive/SpirometrySimulator";
import SmokingTimeline from "@/components/interactive/SmokingTimeline";
import LayerToggle from "@/components/interactive/LayerToggle";
import AnimatedCounter from "@/components/interactive/AnimatedCounter";
import ExploreResourceMatrix from "@/components/explore/ExploreResourceMatrix";

// Icon primitives mapping to Lucide
import { Activity, Droplet, Globe2 } from "lucide-react";

export default function Home() {
  const prefersReducedMotion = useReducedMotion();

  // The scrolling container is 1200vh tall.
  // We place sections absolutely by percentage to exactly match the 240-frame sequence timing.

  return (
    <main className="relative w-full bg-[#050505] overflow-x-hidden" style={{ height: "1200vh" }}>

      {/* 
        =========================================
        THE ENGINE
        =========================================
      */}
      <SequenceCanvas prefersReducedMotion={prefersReducedMotion} />

      {/* 
        =========================================
        CINEMATIC NARRATIVE SECTIONS (SCROLL OVERLAY)
        =========================================
      */}

      {/* SEC 1: HERO (0% - 8%) */}
      <section className="absolute w-full flex flex-col items-center justify-center z-20 pointer-events-none" style={{ top: "0%", height: "8%" }}>
        <BreathingParticles className="opacity-50" />
        <div className="text-center mt-[-10vh] px-4 pointer-events-auto">
          <MetaLabel delay={0.1}>The Human Atlas</MetaLabel>
          <TitleH1 delay={0.2} className="mt-4 mb-6 text-[56px] md:text-[80px]">Two Organs.</TitleH1>
          <TitleH1 delay={0.4} className="text-[56px] md:text-[80px] mt-[-20px] mb-8">One Breath.</TitleH1>
          <BodyText delay={0.6} className="max-w-[500px] mx-auto text-[20px]">
            Scroll to begin an immersive journey through the infinite complexity of the human respiratory system.
          </BodyText>
        </div>
      </section>

      {/* SEC 2: GLASS EXTERIOR (8% - 20%) */}
      <section className="absolute w-full flex items-center justify-start z-20" style={{ top: "8%", height: "12%" }}>
        <div className="ml-[10%] md:ml-[15%] max-w-[450px]">
          <MetaLabel>01 / Exterior Structure</MetaLabel>
          <HeadingH2 className="mt-4 mb-6">The Biological Engine</HeadingH2>
          <BodyText>
            Encased within the thoracic cavity, the lungs are asymmetrical marvels. The right lung, slightly larger, houses three lobes. The left, accommodating the heart, has just two.
          </BodyText>
          <BodyText className="mt-4">
            Together, they process over 10,000 liters of air daily, driving the delicate gas exchange that sustains consciousness itself.
          </BodyText>
        </div>
      </section>

      {/* SEC 3: BRONCHIAL TREE (20% - 32%) */}
      <section className="absolute w-full flex flex-col items-end justify-center z-20 pr-[10%] md:pr-[15%]" style={{ top: "20%", height: "12%" }}>
        <div className="max-w-[500px] text-left">
          <MetaLabel>02 / The Airways</MetaLabel>
          <HeadingH2 className="mt-4 mb-6">Branching to Infinity</HeadingH2>
          <BodyText className="mb-8">
            The trachea bifurcates into primary bronchi, which subdivide up to 23 times into microscopic bronchioles. This fractal branching exponentially increases surface area within a finite volume.
          </BodyText>
          <BronchialDiagram />
        </div>
      </section>

      {/* SEC 4: VASCULAR SYSTEM (32% - 42%) */}
      <section className="absolute w-full flex flex-col items-start justify-center z-20 pl-[10%] md:pl-[15%]" style={{ top: "32%", height: "10%" }}>
        <div className="max-w-[500px]">
          <MetaLabel>03 / Circulation</MetaLabel>
          <HeadingH2 className="mt-4 mb-6">The Oxygen Trade</HeadingH2>
          <BodyText className="mb-8">
            The only place in the human body where arteries carry deoxygenated blood and veins carry oxygenated blood. It is a perfect, isolated low-pressure circuit optimized purely for radical gas exchange.
          </BodyText>
          <CirculatoryFlow />
        </div>
      </section>

      {/* SEC 5: LOBAR DIVISION (42% - 52%) */}
      <section className="absolute w-full flex items-center justify-end z-20" style={{ top: "42%", height: "10%" }}>
        <div className="mr-[10%] md:mr-[15%] max-w-[450px]">
          <MetaLabel>04 / Segmentation</MetaLabel>
          <HeadingH2 className="mt-4 mb-6">Independent Territories</HeadingH2>
          <BodyText>
            Each lobe functions as a quasi-independent organ, complete with its own dedicated vascular and bronchial supply. This modularity ensures catastrophic failure in one segment doesn&apos;t immediately compromise the entire system.
          </BodyText>
        </div>
      </section>

      {/* SEC 6: ALVEOLAR LEVEL (52% - 62%) */}
      <section className="absolute w-full flex flex-col items-center justify-center z-30 pointer-events-none" style={{ top: "52%", height: "10%" }}>
        <div className="text-center max-w-[600px] mb-16 pointer-events-auto">
          <MetaLabel>05 / Micro-Architecture</MetaLabel>
          <HeadingH2 className="mt-4 mb-6">480 Million Alveoli</HeadingH2>
          <BodyText>
            The terminus of the journey. Microscopic sacs wrapped in capillaries so thin that red blood cells must pass single-file, allowing oxygen to instantly diffuse across the membrane.
          </BodyText>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mx-auto justify-center items-center pointer-events-auto">
          <FloatingStatCard
            title="Surface Area"
            stat="100m²"
            description="Roughly the size of a tennis court compacted into the human chest."
            icon={<Globe2 />}
            delay={0.1}
          />
          <FloatingStatCard
            title="Capillary Network"
            stat="280 B"
            description="Capillaries intertwine the alveoli, creating massive contact points."
            icon={<Activity />}
            delay={0.3}
          />
          <FloatingStatCard
            title="Daily Fluid"
            stat="0.5 L"
            description="Moisture exhaled daily merely from the mechanics of breathing."
            icon={<Droplet />}
            delay={0.5}
          />
        </div>
      </section>

      {/* SEC 7: EXPLODED VIEW (62% - 70%) */}
      <section className="absolute w-full flex items-center justify-end z-30" style={{ top: "62%", height: "8%" }}>
        <div className="mr-[5%] md:mr-[10%] w-[400px]">
          <LayerToggle />
        </div>
      </section>

      {/* SEC 8: INTERIOR TUNNEL (70% - 80%) */}
      <section className="absolute w-full flex items-center justify-start z-30" style={{ top: "70%", height: "10%" }}>
        <div className="ml-[5%] md:ml-[10%] w-full max-w-[600px]">
          <SmokingTimeline />
        </div>
      </section>

      {/* SEC 9: PHYSIOLOGY (76% - 83%) */}
      <section className="absolute w-full flex items-center justify-center z-30" style={{ top: "76%", height: "7%" }}>
        <div className="w-full px-4 md:px-0">
          <SpirometrySimulator />
        </div>
      </section>

      {/* SEC 10: DISEASES (83% - 90%) */}
      <section className="absolute w-full flex flex-col items-center justify-center z-30 overflow-hidden" style={{ top: "83%", height: "7%" }}>
        <div className="text-center mb-8">
          <MetaLabel>06 / Pathologies</MetaLabel>
          <HeadingH2 className="mt-4">When The Engine Fails</HeadingH2>
        </div>
        <DiseaseCarousel />
      </section>

      {/* SEC 11: STATS (90% - 96%) */}
      <section className="absolute w-full flex flex-col xl:flex-row items-center justify-center gap-10 md:gap-20 z-30 bg-black/60 backdrop-blur-sm px-4" style={{ top: "90%", height: "6%" }}>
        <div className="flex flex-col md:flex-row bg-black/40 p-6 md:p-10 rounded-3xl border border-white/5 gap-8 md:gap-0">
          <AnimatedCounter value={3} suffix="M+" label="Annual COPD Deaths" duration={2.5} />
          <AnimatedCounter value={262} suffix="M" label="Asthma Sufferers" duration={3.0} />
          <AnimatedCounter value={10} suffix="K+" label="Liters Filtered Daily" duration={2.0} />
        </div>
        <div className="w-full max-w-[600px] xl:max-w-[40vw]">
          <WorldDiseaseMap />
        </div>
      </section>

      {/* SEC 12: REASSEMBLY (96% - 100%) */}
      <section className="absolute w-full flex flex-col items-center justify-center z-20 pointer-events-none pb-[5vh] md:pb-[20vh]" style={{ top: "96%", height: "4%" }}>
        <BreathingParticles className="opacity-80" />
        <div className="text-center px-4 max-w-[600px] pointer-events-auto">
          <MetaLabel delay={0.1}>End of Journey</MetaLabel>
          <HeadingH2 delay={0.3} className="mt-4 mb-8">Take A Deep Breath</HeadingH2>
          <BodyText delay={0.5} className="mb-10 text-[20px]">
            In the time it took you to reach this section, your lungs have completed approximately 40 autonomic respirations, keeping you perfectly alive without a single conscious thought.
          </BodyText>
          <button className="cta-button">
            Restart Simulation
          </button>
        </div>
      </section>

      {/* SEC 13: RESOURCE MATRIX (End of scroll) */}
      <div className="absolute w-full z-40" style={{ top: "100%" }}>
         <ExploreResourceMatrix />
      </div>

    </main>
  );
}
