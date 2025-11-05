"use client";
import "./AnimatedButton.css";
import React, { useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useViewTransition } from "../../hooks/useViewTransition";

import { IoMdArrowForward } from "react-icons/io";

gsap.registerPlugin(ScrollTrigger);

const AnimatedButton = ({
  label,
  route,
  animate = true,
  animateOnScroll = true,
  delay = 0,
}) => {
  const { navigateWithTransition } = useViewTransition();
  const buttonRef = useRef(null);
  const circleRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);

  const waitForFonts = async () => {
    try {
      await document.fonts.ready;
      const customFonts = ["Manrope"];
      const fontCheckPromises = customFonts.map((fontFamily) => {
        return document.fonts.check(`16px ${fontFamily}`);
      });
      await Promise.all(fontCheckPromises);
      await new Promise((resolve) => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return true;
    }
  };

  useGSAP(
    () => {
      if (!buttonRef.current || !textRef.current) return;

      if (!animate) {
        gsap.set(buttonRef.current, { scale: 1 });
        gsap.set(circleRef.current, { scale: 1, opacity: 1 });
        gsap.set(iconRef.current, { opacity: 1, x: 0 });
        gsap.set(textRef.current, { opacity: 1, y: 0 });
        return;
      }

      const initializeAnimation = async () => {
        await waitForFonts();

        gsap.set(buttonRef.current, { scale: 0, transformOrigin: "center" });
        gsap.set(circleRef.current, {
          scale: 0,
          transformOrigin: "center",
          opacity: 0,
        });
        gsap.set(iconRef.current, { opacity: 0, x: -20 });
        gsap.set(textRef.current, { opacity: 0, y: 20 });

        const tl = gsap.timeline({ delay: delay });

        tl.to(buttonRef.current, {
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        });

        tl.to(
          circleRef.current,
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.3"
        );

        tl.to(
          iconRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.4"
        );

        tl.to(
          textRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power4.out",
          },
          "-=0.3"
        );

        if (animateOnScroll) {
          ScrollTrigger.create({
            trigger: buttonRef.current,
            start: "top 90%",
            once: true,
            animation: tl,
          });
        } else {
          tl.play();
        }
      };

      initializeAnimation();

      return () => {
        // Cleanup ScrollTrigger instances
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === buttonRef.current) {
            trigger.kill();
          }
        });
      };
    },
    { scope: buttonRef, dependencies: [animate, animateOnScroll, delay] }
  );

  const buttonContent = (
    <>
      <span className="circle" ref={circleRef} aria-hidden="true"></span>
      <div className="icon" ref={iconRef}>
        <IoMdArrowForward />
      </div>
      <span className="button-text" ref={textRef}>
        {label}
      </span>
    </>
  );

  if (route) {
    return (
      <a
        href={route}
        className="btn"
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          navigateWithTransition(route);
        }}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button className="btn" ref={buttonRef}>
      {buttonContent}
    </button>
  );
};

export default AnimatedButton;
