import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

export function GlassCard({ className, children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-panel rounded-squircle p-6", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
