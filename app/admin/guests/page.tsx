'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/admin/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Edit, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  ChevronLeft, 
  ChevronRight,
  User,
  Phone,
  Mail,
  Grid,
  Send,
  X,
  Loader2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react'

type Guest = {
  id: string
  title: string | null
  full_name: string
  unique_token: string
  email: string | null
  phone: string | null
  rsvp_status: boolean | null
  attendance_count: number
  notes: string | null
  table_number: string | null
  created_at: string
}

export default function GuestsPage() {
  const supabase = createClient()
  const { success, error, warning } = useToast()

  // State
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'attending' | 'declining' | 'no_response'>('all')
  const [limit] = useState(15)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkTableModalOpen, setIsBulkTableModalOpen] = useState(false)
  
  // Active records
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null)
  
  // Input states
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [bulkTableNumber, setBulkTableNumber] = useState('')

  // CSV Import State
  const [importing, setImporting] = useState(false)

  // Fetch guests function
  const fetchGuests = useCallback(async () => {
    setLoading(true)
    try {
      const offset = (page - 1) * limit
      const { data, error: fetchErr } = await supabase.rpc('admin_get_guests', {
        p_search: search || null,
        p_rsvp_filter: rsvpFilter === 'all' ? null : rsvpFilter,
        p_limit: limit,
        p_offset: offset
      })

      if (fetchErr) throw fetchErr

      if (data) {
        setGuests(data as Guest[])
        setTotalCount(data[0]?.total_count ? Number(data[0].total_count) : 0)
      } else {
        setGuests([])
        setTotalCount(0)
      }
    } catch (err: any) {
      console.error(err)
      error('Gagal mengambil data tamu')
    } finally {
      setLoading(false)
    }
  }, [supabase, page, search, rsvpFilter, limit, error])

  useEffect(() => {
    fetchGuests()
  }, [fetchGuests])

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1)
    setSelectedIds([])
  }, [search, rsvpFilter])

  // Copy invitation link helper
  const handleCopyLink = (token: string) => {
    const baseUrl = window.location.origin
    const inviteLink = `${baseUrl}/invite/${token}`
    navigator.clipboard.writeText(inviteLink)
    setCopiedToken(token)
    success('Link undangan disalin ke clipboard')
    setTimeout(() => setCopiedToken(null), 2000)
  }

  // Add Guest Action
  const handleAddGuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    try {
      const { data, error: createErr } = await supabase.rpc('admin_create_guest', {
        p_title: title || null,
        p_full_name: full_name,
        p_email: email || null,
        p_phone: phone || null
      })

      if (createErr) throw createErr

      success('Tamu berhasil ditambahkan')
      setIsAddModalOpen(false)
      fetchGuests()
    } catch (err: any) {
      error('Gagal menambahkan tamu: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Edit Guest Action
  const handleEditGuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingGuest) return
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const table_number = formData.get('table_number') as string
    const rsvp_status_str = formData.get('rsvp_status') as string
    const attendance_count = Number(formData.get('attendance_count'))

    let rsvp_status: boolean | null = null
    if (rsvp_status_str === 'true') rsvp_status = true
    if (rsvp_status_str === 'false') rsvp_status = false

    try {
      const { error: updateErr } = await supabase.rpc('admin_update_guest', {
        p_id: editingGuest.id,
        p_title: title || null,
        p_full_name: full_name,
        p_email: email || null,
        p_phone: phone || null,
        p_table_number: table_number || null,
        p_rsvp_status: rsvp_status,
        p_attendance_count: attendance_count
      })

      if (updateErr) throw updateErr

      success('Data tamu berhasil diperbarui')
      setIsEditModalOpen(false)
      setEditingGuest(null)
      fetchGuests()
    } catch (err: any) {
      error('Gagal memperbarui tamu: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Guest Action
  const handleDeleteGuest = async () => {
    if (!deletingGuest) return
    setSubmitting(true)
    try {
      const { error: deleteErr } = await supabase.rpc('admin_delete_guest', {
        p_id: deletingGuest.id
      })

      if (deleteErr) throw deleteErr

      success('Tamu berhasil dihapus')
      setIsDeleteModalOpen(false)
      setDeletingGuest(null)
      fetchGuests()
    } catch (err: any) {
      error('Gagal menghapus tamu: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Bulk Assign Table Action
  const handleBulkTableAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.length === 0) return
    setSubmitting(true)

    try {
      let failCount = 0
      for (const id of selectedIds) {
        const guest = guests.find(g => g.id === id)
        if (!guest) continue

        const { error: updateErr } = await supabase.rpc('admin_update_guest', {
          p_id: guest.id,
          p_title: guest.title,
          p_full_name: guest.full_name,
          p_email: guest.email,
          p_phone: guest.phone,
          p_table_number: bulkTableNumber || null,
          p_rsvp_status: guest.rsvp_status,
          p_attendance_count: guest.attendance_count
        })

        if (updateErr) failCount++
      }

      if (failCount === 0) {
        success(`Berhasil menetapkan Meja ${bulkTableNumber} untuk ${selectedIds.length} tamu`)
      } else {
        warning(`Berhasil menetapkan meja untuk ${selectedIds.length - failCount} tamu, ${failCount} gagal`)
      }

      setIsBulkTableModalOpen(false)
      setSelectedIds([])
      setBulkTableNumber('')
      fetchGuests()
    } catch (err: any) {
      error('Terjadi kesalahan saat memproses meja massal')
    } finally {
      setSubmitting(false)
    }
  }

  // Bulk Delete Action
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} tamu terpilih secara permanen?`)) return
    
    setSubmitting(true)
    try {
      let failCount = 0
      for (const id of selectedIds) {
        const { error: deleteErr } = await supabase.rpc('admin_delete_guest', {
          p_id: id
        })
        if (deleteErr) failCount++
      }

      if (failCount === 0) {
        success(`Berhasil menghapus ${selectedIds.length} tamu secara massal`)
      } else {
        warning(`Berhasil menghapus ${selectedIds.length - failCount} tamu, ${failCount} gagal`)
      }

      setSelectedIds([])
      fetchGuests()
    } catch (err: any) {
      error('Gagal memproses penghapusan massal')
    } finally {
      setSubmitting(false)
    }
  }

  // CSV Export Action
  const handleExportCSV = () => {
    if (guests.length === 0) {
      error('Tidak ada data untuk diekspor')
      return
    }

    const headers = ['Title', 'Nama Lengkap', 'Email', 'No HP', 'Status RSVP', 'Jumlah Hadir', 'Nomor Meja', 'Link Undangan']
    const baseUrl = window.location.origin

    const csvRows = [
      headers.join(','),
      ...guests.map(g => {
        let rsvp = 'Belum Respon'
        if (g.rsvp_status === true) rsvp = 'Hadir'
        if (g.rsvp_status === false) rsvp = 'Tidak Hadir'

        return [
          `"${g.title || ''}"`,
          `"${g.full_name}"`,
          `"${g.email || ''}"`,
          `"${g.phone || ''}"`,
          `"${rsvp}"`,
          g.attendance_count,
          `"${g.table_number || ''}"`,
          `"${baseUrl}/invite/${g.unique_token}"`
        ].join(',')
      })
    ]

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Daftar_Tamu_Meinita_Emeritus_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('Ekspor CSV berhasil diunduh')
  }

  // CSV Import (File select & parse)
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string
        const lines = text.split(/\r?\n/)
        const parsedGuests = []

        // Basic CSV Parsing (Skipping headers)
        // Expected Columns: Title, Full Name, Email, Phone, Table Number, Token (Optional)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          // Handle double quotes correctly
          const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          
          const cleanCol = (col: string) => {
            if (!col) return ''
            return col.replace(/^"|"$/g, '').trim()
          }

          const title = cleanCol(columns[0])
          const full_name = cleanCol(columns[1])
          const email = cleanCol(columns[2])
          const phone = cleanCol(columns[3])
          const table_number = cleanCol(columns[4])
          const unique_token = cleanCol(columns[5])

          if (full_name) {
            parsedGuests.push({
              title: title || null,
              full_name,
              email: email || null,
              phone: phone || null,
              table_number: table_number || null,
              unique_token: unique_token || null
            })
          }
        }

        if (parsedGuests.length === 0) {
          error('Format CSV tidak cocok atau kosong. Periksa petunjuk kolom.')
          setImporting(false)
          return
        }

        // Call bulk insert RPC
        const { data: count, error: importErr } = await supabase.rpc('admin_bulk_create_guests', {
          p_guests: JSON.stringify(parsedGuests) as any
        })

        if (importErr) throw importErr

        success(`Berhasil mengimpor ${count} tamu secara massal`)
        fetchGuests()
      } catch (err: any) {
        error('Gagal mengimpor file CSV: ' + err.message)
      } finally {
        setImporting(false)
        if (e.target) e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  // Toggle Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === guests.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(guests.map(g => g.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Launch WhatsApp Link Creator helper
  const getWhatsAppLink = (g: Guest) => {
    const baseUrl = window.location.origin
    const inviteLink = `${baseUrl}/invite/${g.unique_token}`
    const text = `Shalom ${g.title || ''} ${g.full_name},

Dengan penuh sukacita, kami mengundang Anda ke Ibadah Emeritus:
✨ Pdt. Ny. Meinita M.E. Wungo-Damping ✨
"Keep Shining in His Grace"

📅 Minggu, 16 Agustus 2026
⏰ 09:00 WIB
📍 GPIB "Bukit Moria", Tebet

Buka undangan digital Anda:
${inviteLink}

Tuhan Yesus memberkati.`

    return `https://wa.me/${g.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`
  }

  // Pagination totals
  const totalPages = Math.ceil(totalCount / limit) || 1

  return (
    <div className="space-y-6 text-white font-sans pb-16">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gradient-gold">Kelola Tamu</h1>
          <p className="text-white/50 text-xs mt-1">
            Undangan aktif: {totalCount} Tamu terdaftar. Buat, ubah, dan impor tamu di sini.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Add Guest Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-[#D4AF37]/25 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Ekspor</span>
          </button>

          {/* Import CSV Input */}
          <label className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
            {importing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
            )}
            <span>Impor</span>
            <input
              type="file"
              accept=".csv"
              disabled={importing}
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari nama, email, nomor HP, atau meja..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 placeholder-white/30 text-white text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/25"
          />
        </div>

        {/* RSVP Filter */}
        <div>
          <select
            value={rsvpFilter}
            onChange={(e) => setRsvpFilter(e.target.value as any)}
            className="w-full bg-[#020C1B] border border-white/10 text-white text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="all">Semua RSVP Status</option>
            <option value="attending">Hadir</option>
            <option value="declining">Tidak Hadir</option>
            <option value="no_response">Belum Respon</option>
          </select>
        </div>
      </div>

      {/* Bulk Operations Bar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl"
        >
          <span className="text-xs font-semibold text-[#D4AF37]">
            {selectedIds.length} tamu dipilih
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsBulkTableModalOpen(true)}
              className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Pilih Meja</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Table / Grid */}
      <div className="premium-glass bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            <p className="text-xs text-white/50 tracking-widest uppercase font-bold">Memuat Data...</p>
          </div>
        ) : guests.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-white/50">Tamu tidak ditemukan</p>
            <p className="text-xs text-white/30 max-w-xs">
              Silakan periksa kata kunci pencarian Anda atau tambahkan tamu baru ke daftar.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-white/50 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === guests.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded accent-[#D4AF37] cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-6">Nama</th>
                    <th className="py-4 px-6">Kontak</th>
                    <th className="py-4 px-6 text-center">RSVP</th>
                    <th className="py-4 px-6 text-center">Porsi</th>
                    <th className="py-4 px-6 text-center">Meja</th>
                    <th className="py-4 px-6 text-center">Tautan</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {guests.map((g) => (
                    <tr key={g.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(g.id)}
                          onChange={() => toggleSelect(g.id)}
                          className="w-4 h-4 rounded accent-[#D4AF37] cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-6 font-semibold whitespace-nowrap">
                        {g.title ? <span className="text-white/40 font-normal mr-1">{g.title}</span> : ''}
                        {g.full_name}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col space-y-1 text-[11px] text-white/70">
                          {g.phone && (
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 text-[#D4AF37] mr-1.5 shrink-0" />
                              {g.phone}
                            </span>
                          )}
                          {g.email && (
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 text-white/40 mr-1.5 shrink-0" />
                              {g.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {g.rsvp_status === true ? (
                          <span className="inline-block text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded uppercase tracking-wider">Hadir</span>
                        ) : g.rsvp_status === false ? (
                          <span className="inline-block text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded uppercase tracking-wider">Berhalangan</span>
                        ) : (
                          <span className="inline-block text-[9px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2.5 py-0.5 rounded uppercase tracking-wider">Pending</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center font-bold">
                        {g.rsvp_status === true ? g.attendance_count : '-'}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-[#D4AF37]">
                        {g.table_number || '-'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleCopyLink(g.unique_token)}
                          className="p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Salin Link Undangan"
                        >
                          {copiedToken === g.unique_token ? (
                            <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {g.phone && (
                            <a
                              href={getWhatsAppLink(g)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-colors inline-flex items-center justify-center cursor-pointer"
                              title="Kirim Undangan WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setEditingGuest(g)
                              setIsEditModalOpen(true)
                            }}
                            className="p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Edit Tamu"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingGuest(g)
                              setIsDeleteModalOpen(true)
                            }}
                            className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Hapus Tamu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Grid Card View */}
            <div className="md:hidden divide-y divide-white/5">
              {guests.map((g) => (
                <div key={g.id} className="p-5 space-y-4 hover:bg-white/2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(g.id)}
                        onChange={() => toggleSelect(g.id)}
                        className="w-4 h-4 rounded accent-[#D4AF37] cursor-pointer shrink-0"
                      />
                      <span className="font-semibold text-sm">
                        {g.title ? <span className="text-white/40 font-normal mr-1">{g.title}</span> : ''}
                        {g.full_name}
                      </span>
                    </div>
                    <div>
                      {g.rsvp_status === true ? (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">Hadir ({g.attendance_count})</span>
                      ) : g.rsvp_status === false ? (
                        <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase tracking-wider">Berhalangan</span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded uppercase tracking-wider">Pending</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60 pl-7">
                    {g.phone && (
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 text-[#D4AF37] mr-1.5 shrink-0" />
                        {g.phone}
                      </span>
                    )}
                    {g.table_number && (
                      <span className="flex items-center font-bold text-[#D4AF37]">
                        <Grid className="w-3.5 h-3.5 text-[#D4AF37] mr-1.5 shrink-0" />
                        Meja: {g.table_number}
                      </span>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end space-x-3 pt-2 pl-7">
                    <button
                      onClick={() => handleCopyLink(g.unique_token)}
                      className="flex items-center space-x-1.5 bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {copiedToken === g.unique_token ? (
                        <>
                          <Check className="w-3 h-3 text-[#D4AF37]" />
                          <span>Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Link</span>
                        </>
                      )}
                    </button>
                    {g.phone && (
                      <a
                        href={getWhatsAppLink(g)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Kirim WA</span>
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setEditingGuest(g)
                        setIsEditModalOpen(true)
                      }}
                      className="p-1.5 rounded border border-white/10 bg-white/5 text-white/80 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingGuest(g)
                        setIsDeleteModalOpen(true)
                      }}
                      className="p-1.5 rounded border border-red-500/20 bg-red-500/10 text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-white/50">
          <span>Halaman {page} dari {totalPages} ({totalCount} tamu)</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 border border-white/10 hover:bg-white/5 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 border border-white/10 hover:bg-white/5 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD GUEST */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A192F] border border-[#D4AF37]/30 p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 text-white"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                <h3 className="text-base font-serif font-bold text-gradient-gold">Tambah Tamu Undangan</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddGuest} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Gelar / Panggilan (Optional)</label>
                  <input type="text" name="title" placeholder="contoh: Pdt. / Bpk. / Ibu" className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Nama Lengkap</label>
                  <input type="text" name="full_name" placeholder="contoh: Aman Saputra" required className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Email (Optional)</label>
                  <input type="email" name="email" placeholder="contoh: aman@example.com" className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Nomor HP / WhatsApp (Optional)</label>
                  <input type="text" name="phone" placeholder="contoh: 628123456789 (format kode negara)" className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  <span className="text-[9px] text-white/30 mt-1 block">Selalu gunakan kode negara di awal (contoh: 62 untuk Indonesia).</span>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg font-bold cursor-pointer">Batal</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] font-bold rounded-lg hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer">
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Simpan</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT GUEST */}
      <AnimatePresence>
        {isEditModalOpen && editingGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingGuest(null)
              }}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A192F] border border-[#D4AF37]/30 p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 text-white"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                <h3 className="text-base font-serif font-bold text-gradient-gold">Ubah Tamu</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingGuest(null)
                  }}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditGuest} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Gelar / Panggilan (Optional)</label>
                  <input type="text" name="title" defaultValue={editingGuest.title || ''} className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Nama Lengkap</label>
                  <input type="text" name="full_name" defaultValue={editingGuest.full_name} required className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Email (Optional)</label>
                  <input type="email" name="email" defaultValue={editingGuest.email || ''} className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Nomor HP (Optional)</label>
                  <input type="text" name="phone" defaultValue={editingGuest.phone || ''} className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Nomor Meja</label>
                    <input type="text" name="table_number" defaultValue={editingGuest.table_number || ''} placeholder="contoh: 5A" className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Jumlah Hadir / Porsi</label>
                    <input type="number" name="attendance_count" defaultValue={editingGuest.attendance_count} min={1} max={10} className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Status RSVP</label>
                  <select name="rsvp_status" defaultValue={String(editingGuest.rsvp_status)} className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37] cursor-pointer">
                    <option value="null">Pending</option>
                    <option value="true">Hadir</option>
                    <option value="false">Tidak Hadir</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setEditingGuest(null)
                    }}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] font-bold rounded-lg hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer">
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Perbarui</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DELETE CONFIRM */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeletingGuest(null)
              }}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A192F] border border-red-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative z-10 text-white"
            >
              <div className="flex items-center space-x-3 text-red-400 mb-4">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-serif font-bold">Hapus Tamu?</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed mb-6">
                Apakah Anda yakin ingin menghapus <strong>{deletingGuest.full_name}</strong> dari daftar undangan secara permanen? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeletingGuest(null)
                  }}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteGuest}
                  disabled={submitting}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  <span>Hapus</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: BULK ASSIGN TABLE */}
      <AnimatePresence>
        {isBulkTableModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkTableModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A192F] border border-[#D4AF37]/30 p-6 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 text-white"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <h3 className="text-base font-serif font-bold text-gradient-gold">Pilih Meja Massal</h3>
                <button onClick={() => setIsBulkTableModalOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBulkTableAssign} className="space-y-4 text-xs">
                <p className="text-white/60">
                  Tetapkan nomor meja untuk {selectedIds.length} tamu terpilih sekaligus:
                </p>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Nomor Meja</label>
                  <input
                    type="text"
                    required
                    placeholder="contoh: 3B / Meja VVIP"
                    value={bulkTableNumber}
                    onChange={(e) => setBulkTableNumber(e.target.value)}
                    className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setIsBulkTableModalOpen(false)} className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg font-bold cursor-pointer">Batal</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] font-bold rounded-lg hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer">
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Terapkan</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
