"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

const Faq = () => {
  const t = useTranslations("faq");

  const faqs = [
    {
      question: t("questions.q1.question"),
      answer: t("questions.q1.answer"),
    },
    {
      question: t("questions.q2.question"),
      answer: t("questions.q2.answer"),
    },
    {
      question: t("questions.q3.question"),
      answer: t("questions.q3.answer"),
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-lg px-6 bg-card"
            >
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default Faq;
