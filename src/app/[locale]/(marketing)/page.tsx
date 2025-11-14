"use client";
import React from "react";

import FeatureStepper from "./_components/feature-stepper";
import { FeatureTabs } from "./_components/feature-tabs";
import LogoMarquee from "./_components/logo-marquee";
import BentoShowcase from "@/app/[locale]/(marketing)/_components/bento-showcase";
import Faq from "@/app/[locale]/(marketing)/_components/faq";
import Hero from "@/app/[locale]/(marketing)/_components/hero";
import { PricingCards } from "@/app/[locale]/(marketing)/_components/pricing/pricing-cards";

const page = () => {
  return (
    <div className="w-full bg-background">
      <Hero />
      <LogoMarquee />
      <BentoShowcase />
      <FeatureTabs />
      <FeatureStepper />
      <PricingCards />
      <Faq />
    </div>
  );
};

export default page;
