'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { ToastProvider } from '@/components/admin/Toast'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-[#0A192F] text-white">
          {children}
        </div>
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0A192F] flex flex-col md:flex-row text-white">
        {/* Sidebar Navigation */}
        <AdminSidebar />

        {/* Content Wrapper */}
        <main className="flex-1 w-full pt-[72px] md:pt-0 overflow-x-hidden">
          <div className="p-6 md:p-10 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}
