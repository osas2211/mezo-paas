"use client"
import React from "react"
import { motion } from "framer-motion"

export const PageLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative flex items-center justify-center">
        {/* Pulsing outer ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-16 h-16 rounded-full bg-primary/20"
        />

        {/* Spinning inner border */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full"
        />

        {/* Center dot */}
        <motion.div
          animate={{
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
        />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-sm font-medium text-white/40 tracking-widest uppercase"
      >
        Loading Dashboard
      </motion.p>
    </div>
  )
}
