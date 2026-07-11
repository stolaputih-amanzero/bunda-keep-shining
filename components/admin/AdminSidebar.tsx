'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  Milestone, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-react'
import { logoutAdmin } from '@/app/admin/actions'
import { useToast } from './Toast'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Guests', href: '/admin/guests', icon: Users },
  { name: 'WhatsApp', href: '/admin/whatsapp', icon: MessageCircle },
  { name: 'Timeline', href: '/admin/timeline', icon: Milestone },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Prayers', href: '/admin/prayers', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { success, error } = useToast()
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logoutAdmin()
      success('Berhasil logout')
      router.push('/admin/login')
      router.refresh()
    } catch (err: any) {
      error('Gagal logout')
    }
  }

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen)

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64'

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between bg-[#020C1B] border-b border-[#D4AF37]/20 px-6 py-4 fixed top-0 left-0 w-full z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] italic font-serif text-sm">
            M
          </div>
          <span className="font-serif italic text-white text-sm">Keep Shining</span>
        </div>
        <button 
          onClick={toggleMobile} 
          className="text-white hover:text-[#D4AF37] transition-colors p-1 cursor-pointer"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobile}
            className="md:hidden fixed inset-0 bg-black z-45"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container (Desktop & Mobile Drawer) */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen z-50 md:z-30 bg-[#020C1B] border-r border-[#D4AF37]/20 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 shrink-0
          ${sidebarWidth}
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:block'}
        `}
      >
        {/* Header Logo section */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] italic font-serif text-base shrink-0">
              M
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="font-serif text-white text-sm">Keep Shining</span>
                <span className="text-[8px] uppercase tracking-wider text-[#D4AF37] font-bold">Admin Portal</span>
              </motion.div>
            )}
          </div>

          {/* Collapse toggle button on Desktop */}
          <button 
            onClick={toggleSidebar} 
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-full border border-white/10 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] text-white/60 transition-all cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-all group relative overflow-hidden font-sans
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#F3E5AB]/5 text-[#D4AF37] border-l-2 border-[#D4AF37]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-white/40 group-hover:text-white/80 transition-colors'}`} />
                {(!isCollapsed || isMobileOpen) && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-4 text-xs font-semibold tracking-wide"
                  >
                    {item.name}
                  </motion.span>
                )}
                
                {/* Collapsed Tooltip */}
                {isCollapsed && !isMobileOpen && (
                  <div className="absolute left-16 bg-[#0A192F] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-2 rounded border border-[#D4AF37]/20 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all group relative font-sans cursor-pointer`}
          >
            <LogOut className="w-5 h-5 shrink-0 text-red-400/70 group-hover:text-red-400" />
            {(!isCollapsed || isMobileOpen) && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-4 text-xs font-semibold tracking-wide"
              >
                Logout
              </motion.span>
            )}

            {/* Collapsed Tooltip */}
            {isCollapsed && !isMobileOpen && (
              <div className="absolute left-16 bg-[#0A192F] text-red-400 text-[10px] uppercase tracking-wider font-bold px-3 py-2 rounded border border-red-500/20 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
