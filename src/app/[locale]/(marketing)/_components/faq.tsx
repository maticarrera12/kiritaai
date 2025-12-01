"use client";

import { motion } from "framer-motion";
import { Message01Icon } from "hugeicons-react";
import { useTranslations } from "next-intl";
import React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Faq = () => {
  const t = useTranslations("faq");

  // Array de IDs de FAQs para iterar
  const faqIds = [
    "how_find_opportunities",
    "searches_vs_analysis",
    "opportunity_score",
    "run_out_credits",
    "ios_support",
    "cancel_subscription",
  ];

  const faqs = faqIds.map((id) => ({
    id,
    question: t(`items.${id}.question`),
    answer: t(`items.${id}.answer`),
  }));

  return (
    <section className="w-full py-12 bg-background">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-16 space-y-4 my-4">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-muted border border-border mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Help Center
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4 my-8">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={faq.id}
              className={cn(
                "border-none rounded-[1.5rem] px-2 transition-all duration-300 ease-out",
                "bg-muted/30 hover:bg-muted/50",
                "data-[state=open]:bg-white dark:data-[state=open]:bg-white/5 data-[state=open]:shadow-xl data-[state=open]:shadow-black/5"
              )}
            >
              <AccordionTrigger className="py-6 px-6 hover:no-underline group [&>svg]:hidden">
                <div className="flex items-center justify-between w-full text-left">
                  <span className="text-lg md:text-xl font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                    {faq.question}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-6 pb-4">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-base md:text-lg text-muted-foreground leading-relaxed"
                >
                  {faq.answer}
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 p-8 rounded-[2rem] bg-muted/30 border border-border/50 text-center">
          <div className="w-12 h-12 bg-background rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-primary">
            <Message01Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t("contact.title")}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t("contact.description")}</p>
          <Button variant="default" className="rounded-full px-8 h-12 font-semibold">
            {t("contact.button")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Faq;
