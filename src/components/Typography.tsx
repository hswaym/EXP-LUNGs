"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const APPLE_SPRING = [0.16, 1, 0.3, 1] as const;

export const scrollTextVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 1.2, ease: APPLE_SPRING }
    },
    exit: {
        opacity: 0,
        y: -20,
        filter: "blur(4px)",
        transition: { duration: 0.8, ease: "easeIn" }
    }
};

// Base motion component that ties into framer-motion whileInView
function ScrollReveal({
    children,
    className,
    as: Component = motion.div,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    as?: React.ElementType;
    delay?: number;
}) {
    const customVariants = {
        ...scrollTextVariants,
        visible: {
            ...scrollTextVariants.visible,
            transition: { ...scrollTextVariants.visible.transition, delay }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MotionComponent = Component as any;

    return (
        <MotionComponent
            variants={customVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.4, margin: "-10% 0px -20% 0px" }}
            className={className}
        >
            {children}
        </MotionComponent>
    );
}

// Typography Library mapping exactly to PCE specifications

export function TitleH1({ children, className, delay = 0 }: { children: ReactNode, className?: string, delay?: number }) {
    return (
        <ScrollReveal
            as={motion.h1}
            delay={delay}
            className={cn("font-display text-[40px] md:text-[56px] lg:text-[72px] font-bold tracking-[-0.03em] leading-[1.05] text-gradient-heading", className)}
        >
            {children}
        </ScrollReveal>
    );
}

export function HeadingH2({ children, className, delay = 0 }: { children: ReactNode, className?: string, delay?: number }) {
    return (
        <ScrollReveal
            as={motion.h2}
            delay={delay}
            className={cn("font-display text-[32px] md:text-[40px] lg:text-[48px] font-semibold tracking-[-0.01em] leading-[1.2] text-gradient-heading", className)}
        >
            {children}
        </ScrollReveal>
    );
}

export function HeadingH3({ children, className, delay = 0 }: { children: ReactNode, className?: string, delay?: number }) {
    return (
        <ScrollReveal
            as={motion.h3}
            delay={delay}
            className={cn("font-display text-[20px] md:text-[24px] font-medium tracking-normal leading-[1.3] text-[rgba(255,255,255,0.90)]", className)}
        >
            {children}
        </ScrollReveal>
    );
}

export function BodyText({ children, className, delay = 0 }: { children: ReactNode, className?: string, delay?: number }) {
    return (
        <ScrollReveal
            as={motion.p}
            delay={delay}
            className={cn("font-body text-[15px] md:text-[18px] font-normal tracking-normal leading-[1.5] text-[rgba(255,255,255,0.60)]", className)}
        >
            {children}
        </ScrollReveal>
    );
}

export function MetaLabel({ children, className, delay = 0 }: { children: ReactNode, className?: string, delay?: number }) {
    return (
        <ScrollReveal
            as={motion.span}
            delay={delay}
            className={cn("font-mono text-[11px] uppercase tracking-[0.06em] text-[rgba(255,255,255,0.25)] block", className)}
        >
            {children}
        </ScrollReveal>
    );
}
