"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const logos = [
  "/assets/nextjs.svg",
  "/assets/nextjs.svg",
  "/assets/nextjs.svg",
  "/assets/nextjs.svg",
  "/assets/nextjs.svg",
  "/assets/nextjs.svg",
];

export default function LogoMarquee() {
  // Duplicar los logos 4 veces para crear un loop infinito suave
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <div className="relative flex w-full overflow-hidden py-10 bg-background">
      {/* Overlay con gradientes en los costados */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background to-transparent z-10" />

      {/* Track de logos */}
      <motion.div
        className="flex gap-16"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          ease: "linear",
          duration: 30, // velocidad ajustada
          repeat: Infinity,
        }}
      >
        {duplicatedLogos.map((logo, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 opacity-70 hover:opacity-100 transition"
          >
            <Image
              src={logo}
              alt={`logo-${i}`}
              width={100}
              height={40}
              className="object-contain dark:invert"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
