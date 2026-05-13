import React, { useState, useRef, useEffect } from "react";
import { X, Save, Book, User, Hash, ImageIcon, Loader2, Upload, CheckCircle2, FileText } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import * as pdfjs from 'pdfjs-dist';

// Configuração do worker do PDF.js via CDN para evitar problemas de build no Vite
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface BookItem {
  id: string;
  title: string;
  author: string;
  total_pages: number;
  current_page: number;
  status: 'reading' | 'completed' | 'wishlist' | 'paused';
  cover_url?: string;
  pdf_url?: string;
}

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  bookToEdit?: BookItem | null;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onSave, bookToEdit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    total_pages: 0,
    status: "reading",
    genre: "",
    notes: "",
    cover_url: "",
    pdf_url: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (bookToEdit) {
        setFormData({
          title: bookToEdit.title,
          author: bookToEdit.author,
          total_pages: bookToEdit.total_pages,
          status: bookToEdit.status,
          genre: '',
          notes: '',
          cover_url: bookToEdit.cover_url || "",
          pdf_url: bookToEdit.pdf_url || ""
        });
        setImagePreview(bookToEdit.cover_url || null);
        setPdfFileName(bookToEdit.pdf_url ? "Arquivo PDF Vinculado" : null);
      } else {
        setFormData({
          title: "",
          author: "",
          total_pages: 0,
          status: "reading",
          genre: "",
          notes: "",
          cover_url: "",
          pdf_url: ""
        });
        setImagePreview(null);
        setPdfFileName(null);
      }
    }
  }, [isOpen, bookToEdit]);

  if (!isOpen) return null;

  const countPdfPages = async (file: File): Promise<number> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      return pdf.numPages;
    } catch (error) {
      console.error("Erro ao contar páginas do PDF:", error);
      return 0;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecione apenas arquivos de imagem (JPEG, PNG, etc).");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/cover_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('book-covers')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;
      const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(data.path);
      setFormData({ ...formData, cover_url: urlData.publicUrl });
      setImagePreview(URL.createObjectURL(file));
    } catch (err: any) {
      console.error("Erro ao enviar imagem:", err);
      alert(`Erro ao enviar imagem: ${err?.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf') {
      alert("Por favor, selecione apenas arquivos PDF.");
      return;
    }

    setUploadingPdf(true);
    setPdfFileName(file.name);
    
    try {
      // Contagem automática de páginas
      const pageCount = await countPdfPages(file);
      if (pageCount > 0) {
        setFormData(prev => ({ ...prev, total_pages: pageCount }));
      }

      const fileName = `${user.id}/book_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('book-pdfs')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;
      const { data: urlData } = supabase.storage.from('book-pdfs').getPublicUrl(data.path);
      setFormData(prev => ({ ...prev, pdf_url: urlData.publicUrl }));
    } catch (err: any) {
      console.error("Erro ao enviar PDF:", err);
      alert(`Erro ao enviar PDF: ${err?.message}`);
      setPdfFileName(null);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      if (bookToEdit) {
        const { error } = await supabase
          .from('books')
          .update(formData)
          .eq('id', bookToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('books')
          .insert({
            ...formData,
            user_id: user.id,
            current_page: 0
          });
        if (error) throw error;
      }
      if (onSave) onSave();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar: " + error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto rounded-3xl"
      >
        <GlassCard className="p-0 border-secondary/30 shadow-2xl">
          <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-secondary/5 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                <Book size={20} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">
                {bookToEdit ? 'Editar Livro' : 'Adicionar ao Acervo'}
              </h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-on-surface/10 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                    <Book size={10} /> TÍTULO DO LIVRO
                  </label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-secondary/50 transition-colors"
                    placeholder="Ex: O Alquimista"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                    <User size={10} /> AUTOR
                  </label>
                  <input 
                    type="text" 
                    value={formData.author}
                    onChange={e => setFormData({...formData, author: e.target.value})}
                    className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-secondary/50 transition-colors"
                    placeholder="Nome do autor"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={10} /> CAPA DO LIVRO (ARQUIVO OU URL)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <input 
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-on-surface/10 hover:border-secondary/40 bg-on-surface/5 rounded-2xl transition-all group overflow-hidden relative"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        ) : uploadingImage ? (
                          <Loader2 className="animate-spin text-secondary" />
                        ) : (
                          <>
                            <Upload size={20} className="opacity-40 group-hover:text-secondary group-hover:opacity-100 transition-all" />
                            <p className="text-[10px] font-bold opacity-40 uppercase">Upload Imagem</p>
                          </>
                        )}
                      </button>
                   </div>
                   <div className="flex flex-col justify-center">
                      <p className="text-[9px] font-bold opacity-40 uppercase mb-1.5 tracking-widest">Ou insira o link:</p>
                      <input 
                        type="url" 
                        value={formData.cover_url}
                        onChange={e => setFormData({...formData, cover_url: e.target.value})}
                        className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-secondary/50 transition-colors"
                        placeholder="https://exemplo.com/capa.jpg"
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={10} /> ARQUIVO PDF (OPCIONAL)
                </label>
                <div className="space-y-2">
                  <input 
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className={`w-full flex items-center gap-4 p-4 border-2 border-dashed rounded-2xl transition-all ${
                      pdfFileName 
                        ? 'border-secondary/40 bg-secondary/5' 
                        : 'border-on-surface/10 bg-on-surface/5 hover:border-secondary/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      {uploadingPdf ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                        {pdfFileName ? (uploadingPdf ? 'Contando páginas...' : 'PDF Vinculado') : 'Selecionar PDF'}
                      </p>
                      <p className="text-[11px] font-bold truncate opacity-60">
                        {pdfFileName || 'Máximo 50MB · Somente .pdf'}
                      </p>
                    </div>
                    {pdfFileName && !uploadingPdf && (
                      <CheckCircle2 size={16} className="text-secondary shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={10} /> TOTAL DE PÁGINAS
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={formData.total_pages}
                      onChange={e => setFormData({...formData, total_pages: parseInt(e.target.value) || 0})}
                      className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-secondary/50 transition-colors"
                    />
                    {uploadingPdf && (
                       <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 size={14} className="animate-spin text-secondary opacity-50" />
                       </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest">STATUS ATUAL</label>
                  <div className="flex gap-2">
                    {['reading', 'completed', 'wishlist'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({...formData, status: status as any})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                          formData.status === status 
                            ? 'bg-secondary text-surface shadow-lg shadow-secondary/20' 
                            : 'bg-on-surface/5 text-on-surface/40 hover:bg-on-surface/10'
                        }`}
                      >
                        {status === 'reading' ? 'Lendo' : status === 'completed' ? 'Lido' : 'Lista'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--glass-border)] flex justify-end gap-3">
              <button 
                type="button"
                onClick={onClose} 
                className="px-6 py-2 rounded-xl border border-[var(--glass-border)] text-[10px] font-bold uppercase tracking-widest hover:bg-on-surface/5 transition-colors"
              >
                CANCELAR
              </button>
              <button 
                type="submit"
                disabled={loading || uploadingImage || uploadingPdf}
                className="px-8 py-2 rounded-xl bg-secondary text-surface text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {bookToEdit ? 'ATUALIZAR LIVRO' : 'SALVAR LIVRO'}
              </button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AddBookModal;
