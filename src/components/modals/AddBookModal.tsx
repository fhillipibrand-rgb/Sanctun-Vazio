import React, { useState, useRef } from "react";
import { X, Save, Book, User, Hash, ImageIcon, FileText, Loader2, Upload, CheckCircle2, Paperclip } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    total_pages: 0,
    status: "reading",
    genre: "",
    notes: "",
    cover_url: ""
  });

  if (!isOpen) return null;

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf') {
      alert("Por favor, selecione apenas arquivos PDF.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("O arquivo PDF não pode ser maior que 50 MB.");
      return;
    }

    setUploadingPdf(true);
    setUploadProgress(10);
    setPdfFileName(file.name);

    try {
      const fileExt = 'pdf';
      const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      setUploadProgress(30);

      const { data, error } = await supabase.storage
        .from('book-pdfs')
        .upload(fileName, file, {
          contentType: 'application/pdf',
          upsert: false
        });

      setUploadProgress(80);

      if (error) {
        console.error("Erro no upload:", error);
        if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
          alert(`Configuração Pendente: O bucket 'book-pdfs' não foi encontrado no seu Supabase.\nErro Real: ${error.message}`);
          setPdfUrl(`local:${file.name}`);
        } else {
          throw error;
        }
      } else {
        const { data: urlData } = supabase.storage
          .from('book-pdfs')
          .getPublicUrl(data.path);

        setPdfUrl(urlData.publicUrl);
      }

      setUploadProgress(100);
    } catch (err: any) {
      console.error("Erro ao fazer upload do PDF:", err);
      alert(`Erro ao enviar PDF: ${err?.message || 'Tente novamente.'}`);
      setPdfFileName(null);
      setPdfUrl("");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('books')
        .insert({
          ...formData,
          user_id: user.id,
          current_page: 0,
          pdf_url: pdfUrl || null
        });

      if (error) throw error;
      if (onSave) onSave();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar livro:", error);
      alert("Erro ao salvar livro: " + (error?.message || "Tente novamente."));
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
              <h3 className="text-xl font-bold tracking-tight">Adicionar ao Acervo</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-on-surface/10 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="space-y-4">
              {/* Título e Autor */}
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

              {/* Capa do Livro */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={10} /> CAPA DO LIVRO (URL)
                </label>
                <input 
                  type="url" 
                  value={formData.cover_url}
                  onChange={e => setFormData({...formData, cover_url: e.target.value})}
                  className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-secondary/50 transition-colors"
                  placeholder="https://exemplo.com/capa.jpg"
                />
              </div>

              {/* Upload PDF — NOVO */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={10} /> ARQUIVO PDF (OPCIONAL)
                </label>

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  id="pdf-upload-input"
                />

                {!pdfFileName ? (
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="w-full flex items-center justify-center gap-3 py-5 border-2 border-dashed border-secondary/30 hover:border-secondary/60 bg-secondary/5 hover:bg-secondary/10 rounded-2xl transition-all group cursor-pointer disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-secondary">Anexar PDF</p>
                      <p className="text-[10px] opacity-50 mt-0.5">Máximo 50 MB · somente .pdf</p>
                    </div>
                  </button>
                ) : (
                  <div className="w-full flex items-center gap-4 p-4 border border-secondary/30 bg-secondary/5 rounded-2xl">
                    {uploadingPdf ? (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                          <Loader2 size={20} className="animate-spin" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{pdfFileName}</p>
                          <div className="mt-2 h-1 w-full bg-on-surface/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-secondary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <p className="text-[10px] text-secondary mt-1 font-bold">{uploadProgress}% enviado...</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate text-secondary">{pdfFileName}</p>
                          <p className="text-[10px] opacity-50 mt-0.5">PDF anexado com sucesso</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setPdfFileName(null); setPdfUrl(""); setUploadProgress(0); }}
                          className="p-1.5 hover:bg-on-surface/10 rounded-lg transition-colors opacity-50 hover:opacity-100 shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Páginas e Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={10} /> TOTAL DE PÁGINAS
                  </label>
                  <input 
                    type="number" 
                    value={formData.total_pages}
                    onChange={e => setFormData({...formData, total_pages: parseInt(e.target.value) || 0})}
                    className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-secondary/50 transition-colors"
                  />
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
                disabled={loading || uploadingPdf}
                className="px-8 py-2 rounded-xl bg-secondary text-surface text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                SALVAR LIVRO
              </button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AddBookModal;
