"use client";

import { motion } from "framer-motion";
import { Save, Bell, Plug, Calendar } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const items = [
  {
    title: "Save your files",
    desc: "We automatically save your files as you type.",
    img: "https://picsum.photos/800/600?random=1",
    icon: Save,
  },
  {
    title: "Notifications",
    desc: "Get notified when something happens.",
    img: "https://picsum.photos/800/600?random=2",
    icon: Bell,
  },
  {
    title: "Integrations",
    desc: "Supports 100+ integrations and counting.",
    img: "https://picsum.photos/800/600?random=3",
    icon: Plug,
  },
  {
    title: "Calendar",
    desc: "Use the calendar to filter your files by date.",
    img: "https://picsum.photos/800/600?random=4",
    icon: Calendar,
  },
];

export default function BentoShowcase() {
  return (
    <div className="w-full max-w-6xl mx-auto grid gap-6 py-16">
      {/* ROW 1 → 70 / 30 */}
      <div className="grid grid-cols-10 gap-6">
        <div className="col-span-7">
          <BentoCard {...items[0]} />
        </div>
        <div className="col-span-3">
          <BentoCard {...items[1]} />
        </div>
      </div>

      {/* ROW 2 → 30 / 70 */}
      <div className="grid grid-cols-10 gap-6">
        <div className="col-span-3">
          <BentoCard {...items[2]} />
        </div>
        <div className="col-span-7">
          <BentoCard {...items[3]} />
        </div>
      </div>
    </div>
  );
}

function BentoCard({ title, desc, img, icon: Icon }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative group h-[260px] md:h-[300px] rounded-2xl overflow-hidden border border-white/10 bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image */}
      <Image
        src={img}
        fill
        alt=""
        className="object-cover absolute inset-0 opacity-[0.25] group-hover:opacity-[0.45] transition-all duration-500"
      />

      {/* Light translucent overlay on hover */}
      <motion.div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.08] transition-all duration-500" />

      {/* Animated glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        animate={{ opacity: [0, 0.2, 0.1, 0.2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-white/20 blur-3xl" />
      </motion.div>

      {/* Content (bottom aligned) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col gap-2"
        animate={{
          y: isHovered ? -24 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-1"
        >
          <Icon className="w-6 h-6 text-white/90" />
        </motion.div>

        {/* Title and Description Container */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg md:text-xl font-semibold text-white">{title}</h3>
          <p className="text-neutral-300 text-sm leading-tight">{desc}</p>
        </div>

        {/* Learn More */}
        <motion.div
          animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? "auto" : 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <motion.div
            className="text-white text-sm flex items-center gap-1 mt-2"
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : -10,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            Learn more →
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Border glow */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/20 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all duration-500" />
    </motion.div>
  );
}
