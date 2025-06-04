"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useIntersectionObserver } from "@/lib/hooks"
import { motion } from "framer-motion"

interface SectionProps {
  id: string
  title: string
  subtitle?: string
  titleGradient?: string
  children: React.ReactNode
  className?: string
}

export function Section({
  id,
  title,
  subtitle,
  titleGradient = "from-cyan-400 to-purple-400",
  children,
  className = "",
}: SectionProps) {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "0px 0px -10% 0px",
  })

  const headerRef = useRef<HTMLElement | null>(null)

  // Update URL hash when section is in view (for better SEO and analytics)
  useEffect(() => {
    if (isVisible) {
      // We're using replaceState to avoid adding to browser history
      window.history.replaceState(null, "", `#${id}`)
    }
  }, [isVisible, id])

  return (
    <section
      id={id}
      ref={(el) => {
        ref(el)
        headerRef.current = el
      }}
      className={`py-12 md:py-20 px-4 relative scroll-mt-16 ${className}`}
      aria-labelledby={`heading-${id}`}
    >
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2
            id={`heading-${id}`}
            className={`text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent mb-4`}
            data-section-title={title}
          >
            {title}
          </h2>
          {subtitle && <p className="text-lg md:text-xl text-gray-300">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  )
}

interface TwoColumnSectionProps {
  id: string
  title: string
  subtitle?: string
  titleGradient?: string
  leftColumn: React.ReactNode
  rightColumn: React.ReactNode
  className?: string
  reverseOnMobile?: boolean
}

export function TwoColumnSection({
  id,
  title,
  subtitle,
  titleGradient = "from-cyan-400 to-purple-400",
  leftColumn,
  rightColumn,
  className = "",
  reverseOnMobile = false,
}: TwoColumnSectionProps) {
  return (
    <Section id={id} title={title} subtitle={subtitle} titleGradient={titleGradient} className={className}>
      <div
        className={`grid md:grid-cols-2 gap-8 md:gap-12 ${reverseOnMobile ? "flex flex-col-reverse md:flex-row md:grid" : ""}`}
      >
        <div>{leftColumn}</div>
        <div>{rightColumn}</div>
      </div>
    </Section>
  )
}
