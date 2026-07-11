'use client'

import { motion } from 'framer-motion'

interface BarChartProps {
  data: { label: string; value: number }[]
  title?: string
}

export default function BarChart({ data, title }: BarChartProps) {
  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values, 5) // Fallback max value

  return (
    <div className="p-4 flex flex-col h-full font-sans">
      {title && (
        <h3 className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-6">
          {title}
        </h3>
      )}
      
      <div className="flex-1 flex items-end justify-between h-44 gap-2.5 border-b border-white/10 pb-2">
        {data.map((item, idx) => {
          const heightPct = (item.value / maxValue) * 100
          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="absolute -top-7 bg-[#0A192F] border border-[#D4AF37]/30 text-white text-[9px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                {item.value} tamu
              </div>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
                className="w-full max-w-[20px] rounded-t bg-gradient-to-t from-[#D4AF37]/20 to-[#D4AF37] group-hover:from-[#D4AF37]/40 transition-all border border-[#D4AF37]/20"
              />

              {/* Bar Label */}
              <span className="text-[8px] text-white/50 font-bold uppercase tracking-wider mt-2.5 truncate max-w-[40px] text-center">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
