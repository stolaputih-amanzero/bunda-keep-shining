'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/admin/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ImageIcon, 
  Plus, 
  Trash2, 
  X, 
  Upload, 
  Loader2, 
  AlertTriangle,
  Edit,
  Layers
} from 'lucide-react'

type PhotoType = {
  id: string
  image_url: string
  caption: string | null
  order_index: number
  created_at: string
}

export default function GalleryPage() {
  const supabase = createClient()
  const { success, error, warning } = useToast()

  const [photos, setPhotos] = useState<PhotoType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Active records
  const [editingPhoto, setEditingPhoto] = useState<PhotoType | null>(null)
  const [deletingPhoto, setDeletingPhoto] = useState<PhotoType | null>(null)

  // Fetch gallery photos
  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase.rpc('admin_get_gallery_photos')
      if (err) throw err
      if (data) {
        setPhotos(data as PhotoType[])
      } else {
        setPhotos([])
      }
    } catch (e: any) {
      error('Gagal memuat galeri: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [supabase, error])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  // Multi-file upload and save to db
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    let uploadCount = 0
    let failCount = 0

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `photo_${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`
        const filePath = `photos/${fileName}`

        // 1. Upload to Supabase Storage bucket 'gallery'
        const { error: uploadErr } = await supabase.storage
          .from('gallery')
          .upload(filePath, file)

        if (uploadErr) {
          failCount++
          continue
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath)

        // 3. Save to database via RPC
        const { error: createErr } = await supabase.rpc('admin_create_gallery_photo', {
          p_image_url: publicUrl,
          p_caption: '', // Default caption empty
          p_order_index: photos.length + i // Append index at the end
        })

        if (createErr) {
          failCount++
        } else {
          uploadCount++
        }
      }

      if (uploadCount > 0) {
        success(`Berhasil mengunggah ${uploadCount} foto ke galeri`)
      }
      if (failCount > 0) {
        warning(`${failCount} foto gagal diunggah`)
      }

      fetchPhotos()
    } catch (err: any) {
      error('Terjadi kesalahan selama pengunggahan gambar: ' + err.message)
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  // Edit Photo Action
  const handleEditPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPhoto) return
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const caption = formData.get('caption') as string
    const order_index = Number(formData.get('order_index'))

    try {
      const { error: updateErr } = await supabase.rpc('admin_update_gallery_photo', {
        p_id: editingPhoto.id,
        p_image_url: editingPhoto.image_url,
        p_caption: caption || null,
        p_order_index: order_index
      })

      if (updateErr) throw updateErr

      success('Foto galeri berhasil diperbarui')
      setIsEditModalOpen(false)
      setEditingPhoto(null)
      fetchPhotos()
    } catch (err: any) {
      error('Gagal memperbarui foto: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Photo Action
  const handleDeletePhoto = async () => {
    if (!deletingPhoto) return
    setSubmitting(true)
    try {
      const { error: deleteErr } = await supabase.rpc('admin_delete_gallery_photo', {
        p_id: deletingPhoto.id
      })

      if (deleteErr) throw deleteErr

      success('Foto berhasil dihapus')
      setIsDeleteModalOpen(false)
      setDeletingPhoto(null)
      fetchPhotos()
    } catch (err: any) {
      error('Gagal menghapus foto: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-white font-sans pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gradient-gold">Galeri Foto</h1>
          <p className="text-white/50 text-xs mt-1">
            Total {photos.length} foto dipajang di halaman undangan digital.
          </p>
        </div>

        {/* Upload Button */}
        <label className="flex items-center space-x-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all cursor-pointer shrink-0">
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>Unggah Foto</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleBulkUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Grid of gallery photos */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          <p className="text-xs text-white/50 tracking-widest uppercase font-bold">Memuat Galeri...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="premium-glass bg-white/5 border border-white/10 rounded-2xl p-20 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-white/50">Belum ada foto galeri</p>
          <p className="text-xs text-white/30 max-w-xs">
            Klik tombol di atas untuk memilih dan mengunggah kenangan foto pelayanan pertama.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((p) => (
            <div 
              key={p.id}
              className="premium-glass bg-white/5 border border-white/10 hover:border-[#D4AF37]/35 rounded-2xl overflow-hidden flex flex-col justify-between shadow-md relative group transition-all"
            >
              {/* Photo Image */}
              <div className="aspect-square relative w-full overflow-hidden bg-black">
                <img 
                  src={p.image_url} 
                  alt={p.caption || 'Foto Galeri'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Float Order Badge */}
                <div className="absolute top-2 left-2 bg-[#0A192F]/80 border border-[#D4AF37]/35 text-[#D4AF37] px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold">
                  Idx: {p.order_index}
                </div>
              </div>

              {/* Info Body */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <p className="text-[10px] text-white/80 line-clamp-2 leading-relaxed h-7 font-sans">
                  {p.caption || <span className="text-white/20 italic">Tanpa keterangan</span>}
                </p>
                
                <div className="flex gap-2 justify-end border-t border-white/5 pt-2">
                  <button
                    onClick={() => {
                      setEditingPhoto(p)
                      setIsEditModalOpen(true)
                    }}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors cursor-pointer"
                    title="Ubah Caption"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingPhoto(p)
                      setIsDeleteModalOpen(true)
                    }}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: EDIT CAPTION & ORDER */}
      <AnimatePresence>
        {isEditModalOpen && editingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingPhoto(null)
              }}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A192F] border border-[#D4AF37]/30 p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 text-white animate-fade-in"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                <h3 className="text-base font-serif font-bold text-gradient-gold">Ubah Detail Foto</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingPhoto(null)
                  }}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditPhoto} className="space-y-4 text-xs">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10 mb-4">
                  <img src={editingPhoto.image_url} alt="Pratinjau" className="w-full h-full object-cover" />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Keterangan / Caption Foto</label>
                  <textarea name="caption" defaultValue={editingPhoto.caption || ''} placeholder="Tulis caption singkat..." rows={2} className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37] resize-none font-sans" />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/55 block mb-1.5 font-bold">Urutan Pajang (Index)</label>
                  <input type="number" name="order_index" defaultValue={editingPhoto.order_index} required className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setEditingPhoto(null)
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

      {/* MODAL: DELETE PHOTO CONFIRM */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeletingPhoto(null)
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
                <h3 className="text-base font-serif font-bold">Hapus Foto?</h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed mb-6">
                Apakah Anda yakin ingin menghapus foto terpilih secara permanen?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeletingPhoto(null)
                  }}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeletePhoto}
                  disabled={submitting}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
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
