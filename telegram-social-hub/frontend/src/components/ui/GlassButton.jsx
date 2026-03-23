import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

export function GlassButton({ className, children, onClick, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "glass-button rounded-squircle px-6 py-3 font-medium flex items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
