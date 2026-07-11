'use client'

import { motion } from 'framer-motion'

interface PieChartProps {
  attending: number
  declining: number
  noResponse: number
}

export default function PieChart({ attending, declining, noResponse }: PieChartProps) {
  const total = attending + declining + noResponse
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-white/40 italic text-xs font-sans">
        Tidak ada data
      </div>
    )
  }

  // Calculate percentages
  const pctAttending = (attending / total) * 100
  const pctDeclining = (declining / total) * 100
  const pctNoResponse = (noResponse / total) * 100

  // Standard SVG circle properties
  const radius = 38
  const circumference = 2 * Math.PI * radius

  // Calculate stroke offsets
  const strokeAttending = circumference * (pctAttending / 100)
  const strokeDeclining = circumference * (pctDeclining / 100)
  const strokeNoResponse = circumference * (pctNoResponse / 100)

  // Offsets accumulate (we start at 12 o'clock, which is -90 degrees)
  const offsetAttending = 0
  const offsetDeclining = strokeAttending
  const offsetNoResponse = strokeAttending + strokeDeclining

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around p-4 gap-6 font-sans">
      {/* SVG Chart */}
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
          
          {/* No Response segment (Gray) */}
          {noResponse > 0 && (
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#64748b"
              strokeWidth="8"
              strokeDasharray={`${strokeNoResponse} ${circumference}`}
              strokeDashoffset={-offsetNoResponse}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}

          {/* Declining segment (Rose/Red) */}
          {declining > 0 && (
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth="8"
              strokeDasharray={`${strokeDeclining} ${circumference}`}
              strokeDashoffset={-offsetDeclining}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
            />
          )}

          {/* Attending segment (Gold) */}
          {attending > 0 && (
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#D4AF37"
              strokeWidth="8"
              strokeDasharray={`${strokeAttending} ${circumference}`}
              strokeDashoffset={-offsetAttending}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[8px] text-white/50 uppercase tracking-[0.2em] font-bold">Total</span>
          <span className="text-xl font-serif font-bold text-white mt-0.5">{total}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col space-y-2.5">
        <div className="flex items-center text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] mr-3" />
          <span className="text-white/60 font-semibold w-24">Hadir:</span>
          <span className="text-white font-bold text-right w-8">{attending}</span>
          <span className="text-white/30 text-[10px] ml-2">({pctAttending.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] mr-3" />
          <span className="text-white/60 font-semibold w-24">Tidak Hadir:</span>
          <span className="text-white font-bold text-right w-8">{declining}</span>
          <span className="text-white/30 text-[10px] ml-2">({pctDeclining.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#64748b] mr-3" />
          <span className="text-white/60 font-semibold w-24">Belum Respon:</span>
          <span className="text-white font-bold text-right w-8">{noResponse}</span>
          <span className="text-white/30 text-[10px] ml-2">({pctNoResponse.toFixed(0)}%)</span>
        </div>
      </div>
    </div>
  )
}
