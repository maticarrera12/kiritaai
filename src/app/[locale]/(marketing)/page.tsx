"use client";
import React from "react";
import { PricingCards } from "@/app/[locale]/(marketing)/_components/pricing/pricing-cards";
import BentoShowcase from "@/app/[locale]/(marketing)/_components/bento-showcase";
import Hero from "@/app/[locale]/(marketing)/_components/hero";
import Faq from "@/app/[locale]/(marketing)/_components/faq";
import LogoMarquee from "./_components/logo-marquee";

const page = () => {
  return (
    <div className="w-full bg-background">
      <Hero />
      <LogoMarquee />
      <BentoShowcase />
      <PricingCards />
      <Faq />
    </div>
  );
};

export default page;
