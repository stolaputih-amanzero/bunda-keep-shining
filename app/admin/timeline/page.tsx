'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/admin/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Milestone, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Upload, 
  Loader2, 
  AlertTriangle,
  Calendar,
  Layers
} from 'lucide-react'

type MilestoneType = {
  id: string
  year: number
  title: string
  description: string | null
  image_url: string | null
  order_index: number
}

export default function TimelinePage() {
  const supabase = createClient()
  const { success, error } = useToast()

  const [milestones, setMilestones] = useState<MilestoneType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Active items
  const [editingMilestone, setEditingMilestone] = useState<MilestoneType | null>(null)
  const [deletingMilestone, setDeletingMilestone] = useState<MilestoneType | null>(null)

  // Uploaded image state
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Fetch Milestones
  const fetchMilestones = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase.rpc('admin_get_timeline_milestones')
      if (err) throw err
      if (data) {
        setMilestones(data as MilestoneType[])
      } else {
        setMilestones([])
      }
    } catch (e: any) {
      error('Gagal memuat timeline: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [supabase, error])

  useEffect(() => {
    fetchMilestones()
  }, [fetchMilestones])

  // Handle image upload to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `milestone_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `timeline/${fileName}`

      const { data, error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(filePath, file)

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
      success('Gambar milestone berhasil diunggah')
    } catch (err: any) {
      error('Gagal mengunggah gambar: ' + err.message + '. Pastikan bucket "gallery" dibuat public.')
    } finally {
      setUploading(false)
    }
  }

  // Create Milestone Action
  const handleAddMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const year = Number(formData.get('year'))
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const order_index = Number(formData.get('order_index'))

    try {
      const { error: createErr } = await supabase.rpc('admin_create_timeline_milestone', {
        p_year: year,
        p_title: title,
        p_description: description || null,
        p_image_url: imageUrl || null,
        p_order_index: order_index
      })

      if (createErr) throw createErr

      success('Milestone baru berhasil ditambahkan')
      setIsAddModalOpen(false)
      setImageUrl(null)
      fetchMilestones()
    } catch (err: any) {
      error('Gagal menambahkan milestone: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Edit Milestone Action
  const handleEditMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingMilestone) return
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const year = Number(formData.get('year'))
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const order_index = Number(formData.get('order_index'))

    try {
      const { error: updateErr } = await supabase.rpc('admin_update_timeline_milestone', {
        p_id: editingMilestone.id,
        p_year: year,
        p_title: title,
        p_description: description || null,
        p_image_url: imageUrl !== null ? imageUrl : editingMilestone.image_url,
        p_order_index: order_index
      })

      if (updateErr) throw updateErr

      success('Milestone berhasil diperbarui')
      setIsEditModalOpen(false)
      setEditingMilestone(null)
      setImageUrl(null)
      fetchMilestones()
    } catch (err: any) {
      error('Gagal memperbarui milestone: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Milestone Action
  const handleDeleteMilestone = async () => {
    if (!deletingMilestone) return
    setSubmitting(true)
    try {
      const { error: deleteErr } = await supabase.rpc('admin_delete_timeline_milestone', {
        p_id: deletingMilestone.id
      })

      if (deleteErr) throw deleteErr

      success('Milestone berhasil dihapus')
      setIsDeleteModalOpen(false)
      setDeletingMilestone(null)
      fetchMilestones()
    } catch (err: any) {
      error('Gagal menghapus milestone: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-white font-sans pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gradient-gold">Timeline Milestones</h1>
          <p className="text-white/50 text-xs mt-1">
            Kelola peristiwa penting pelayanan Emeritus Pdt. Ny. Meinita M.E. Wungo-Damping (38 Tahun Pelayanan).
          </p>
        </div>
        <button
          onClick={() => {
            setImageUrl(null)
            setIsAddModalOpen(true)
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Milestone</span>
        </button>
      </div>

      {/* Grid of milestones */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          <p className="text-xs text-white/50 tracking-widest uppercase font-bold">Memuat Timeline...</p>
        </div>
      ) : milestones.length === 0 ? (
        <div className="premium-glass bg-white/5 border border-white/10 rounded-2xl p-20 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
            <Milestone className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-white/50">Belum ada milestone</p>
          <p className="text-xs text-white/30 max-w-xs">
            Klik tombol di atas untuk menambahkan sejarah perjalanan pelayanan pertama.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {milestones.map((m) => (
            <div 
              key={m.id} 
              className="premium-glass bg-white/5 border border-white/10 hover:border-[#D4AF37]/35 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between shadow-md group transition-all"
            >
              <div className="flex gap-4 items-start sm:items-center">
                {/* Year tag */}
                <div className="w-16 py-2 rounded-lg bg-gradient-to-b from-[#0A192F] to-[#020C1B] border border-[#D4AF37]/30 text-[#D4AF37] text-center shrink-0 shadow-inner">
                  <span className="text-xs uppercase tracking-wider font-bold">Tahun</span>
                  <span className="text-sm font-serif font-bold block">{m.year}</span>
                </div>
                
                {/* Photo Thumbnail */}
                {m.image_url ? (
                  <img src={m.image_url} alt={m.title} className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                )}

                <div className="space-y-1">
                  <h3 className="text-sm font-serif font-bold text-white leading-tight">{m.title}</h3>
                  <p className="text-xs text-white/60 font-sans leading-relaxed max-w-xl">{m.description || 'Tidak ada deskripsi'}</p>
                  <span className="inline-block text-[9px] uppercase tracking-wider text-[#D4AF37]/50 font-bold">Urutan: {m.order_index}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 shrink-0">
                <button
                  onClick={() => {
                    setEditingMilestone(m)
                    setImageUrl(null) // Reset temporary image
                    setIsEditModalOpen(true)
                  }}
                  className="flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Ubah</span>
                </button>
                <button
                  onClick={() => {
                    setDeletingMilestone(m)
                    setIsDeleteModalOpen(true)
                  }}
                  className="flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD MILESTONE */}
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
                <h3 className="text-base font-serif font-bold text-gradient-gold">Tambah Milestone Baru</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMilestone} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Tahun Peristiwa</label>
                    <input type="number" name="year" placeholder="contoh: 1988" required className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Index Urutan</label>
                    <input type="number" name="order_index" defaultValue={0} required className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Judul Milestone / Posisi Pelayanan</label>
                  <input type="text" name="title" placeholder="contoh: Ditahbiskan sebagai Pendeta" required className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Deskripsi / Penjelasan Singkat</label>
                  <textarea name="description" placeholder="Ceritakan detail pelayanan atau peristiwa penting ini..." rows={3} className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37] resize-none" />
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Foto Milestone (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={imageUrl || ''} 
                      readOnly 
                      placeholder="Pilih berkas gambar untuk mengunggah..."
                      className="flex-1 bg-[#020C1B] border border-white/10 p-3 rounded-lg text-white/60 focus:outline-none"
                    />
                    <label className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-lg font-bold flex items-center justify-center cursor-pointer shrink-0 transition-colors">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        disabled={uploading}
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>
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

      {/* MODAL: EDIT MILESTONE */}
      <AnimatePresence>
        {isEditModalOpen && editingMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingMilestone(null)
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
                <h3 className="text-base font-serif font-bold text-gradient-gold">Ubah Milestone</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingMilestone(null)
                  }}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditMilestone} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Tahun Peristiwa</label>
                    <input type="number" name="year" defaultValue={editingMilestone.year} required className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Index Urutan</label>
                    <input type="number" name="order_index" defaultValue={editingMilestone.order_index} required className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Judul Milestone / Posisi Pelayanan</label>
                  <input type="text" name="title" defaultValue={editingMilestone.title} required className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Deskripsi / Penjelasan Singkat</label>
                  <textarea name="description" defaultValue={editingMilestone.description || ''} rows={3} className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37] resize-none" />
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Foto Milestone (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={imageUrl !== null ? imageUrl : (editingMilestone.image_url || '')} 
                      readOnly 
                      placeholder="Pilih berkas gambar untuk mengunggah..."
                      className="flex-1 bg-[#020C1B] border border-white/10 p-3 rounded-lg text-white/60 focus:outline-none"
                    />
                    <label className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-lg font-bold flex items-center justify-center cursor-pointer shrink-0 transition-colors">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        disabled={uploading}
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setEditingMilestone(null)
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
        {isDeleteModalOpen && deletingMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeletingMilestone(null)
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
                <h3 className="text-base font-serif font-bold">Hapus Milestone?</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed mb-6">
                Apakah Anda yakin ingin menghapus milestone tahun <strong>{deletingMilestone.year} ({deletingMilestone.title})</strong> secara permanen?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeletingMilestone(null)
                  }}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteMilestone}
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

    </div>
  )
}
