import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Book, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Library,
  ChevronRight,
  Download,
  Trash2,
  ExternalLink
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import AddBookModal from "../components/modals/AddBookModal";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

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

const Reading = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'collection' | 'stats'>('library');
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBooks(data);
    setLoading(false);
  };

  const updateProgress = async (id: string, page: number) => {
    const { error } = await supabase
      .from('books')
      .update({ current_page: page })
      .eq('id', id);
    
    if (!error) {
      setBooks(books.map(b => b.id === id ? { ...b, current_page: page } : b));
    }
  };

  const exportToCSV = () => {
    if (books.length === 0) return;
    
    const headers = ["Título", "Autor", "Status", "Páginas Lidas", "Total de Páginas", "Progresso (%)"];
    const rows = books.map(book => [
      `"${book.title.replace(/"/g, '""')}"`,
      `"${book.author.replace(/"/g, '""')}"`,
      book.status,
      book.current_page.toString(),
      book.total_pages.toString(),
      Math.round((book.current_page / book.total_pages) * 100).toString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `biblioteca_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 pt-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2 opacity-50">
          <BookOpen size={12} className="text-secondary" />
          <p className="editorial-label !tracking-[0.2em]">CONHECIMENTO & ACERVO</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Biblioteca Pessoal</h2>
            <p className="text-on-surface-variant opacity-60 max-w-2xl text-sm leading-relaxed mt-2">
              Explore seu acervo, gerencie seus PDFs e registre cada passo da sua evolução intelectual.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              disabled={books.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-on-surface/5 hover:bg-on-surface/10 border border-[var(--glass-border)] rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={14} /> EXPORTAR CSV
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-surface rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-secondary/20"
            >
              <Plus size={16} /> ADICIONAR LIVRO
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex gap-4 p-1 bg-on-surface/5 rounded-2xl w-fit">
        {(['library', 'collection', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-surface text-secondary shadow-sm' 
                : 'text-on-surface/40 hover:text-on-surface/60'
            }`}
          >
            {tab === 'library' ? 'Biblioteca' : tab === 'collection' ? 'Acervo PDF' : 'Estatísticas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 opacity-30 editorial-label animate-pulse">
          SINCRONIZANDO BIBLIOTECA...
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'library' && (
            <motion.div 
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {books.map((book) => {
                const progress = (book.current_page / book.total_pages) * 100;
                return (
                  <GlassCard key={book.id} className="p-0 border-secondary/10 overflow-hidden flex flex-col h-full group">
                    <div className="aspect-[3/4] bg-on-surface/5 relative overflow-hidden">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-20">
                          <Book size={48} />
                          <p className="text-[9px] font-bold uppercase tracking-widest">Sem Capa</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider ${
                          book.status === 'reading' ? 'bg-secondary text-surface' : 'bg-on-surface/20 text-on-surface'
                        }`}>
                          {book.status === 'reading' ? 'Lendo Agora' : 'Pausado'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-base leading-tight mb-1 group-hover:text-secondary transition-colors">{book.title}</h3>
                      <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mb-6">{book.author}</p>
                      
                      <div className="mt-auto space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                            <span className="opacity-40">Progresso</span>
                            <span className="text-secondary">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
                            <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="opacity-30">{book.current_page}</span>
                          <span className="opacity-30">/</span>
                          <span className="opacity-30">{book.total_pages} pg</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
              {books.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-20 border-2 border-dashed border-on-surface/10 rounded-3xl">
                  <Library size={48} className="mx-auto mb-4" />
                  <p className="editorial-label text-xs">Sua estante virtual está vazia.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'collection' && (
            <motion.div 
              key="collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {books.filter(b => b.pdf_url).map(book => (
                <GlassCard key={book.id} className="p-6 border-on-surface/5 flex items-center gap-4 hover:bg-on-surface/[0.03] transition-all">
                  <div className="w-12 h-12 bg-red-400/10 text-red-400 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{book.title}</h4>
                    <p className="text-[10px] opacity-40 uppercase font-bold truncate">{book.author}</p>
                  </div>
                  <button className="p-2 hover:bg-on-surface/10 rounded-lg transition-colors">
                    <Download size={18} className="opacity-40" />
                  </button>
                </GlassCard>
              ))}
              <div className="col-span-full py-20 text-center opacity-20 border-2 border-dashed border-on-surface/10 rounded-3xl">
                <p className="editorial-label text-xs">Seus arquivos PDF aparecerão aqui.</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <GlassCard className="p-8 text-center space-y-4">
                <TrendingUp size={32} className="mx-auto text-secondary" />
                <div>
                  <p className="editorial-label text-xs">LIVROS CONCLUÍDOS</p>
                  <h3 className="text-4xl font-bold mt-1">{books.filter(b => b.status === 'completed').length}</h3>
                </div>
              </GlassCard>
              <GlassCard className="p-8 text-center space-y-4">
                <Clock size={32} className="mx-auto text-secondary" />
                <div>
                  <p className="editorial-label text-xs">PÁGINAS LIDAS</p>
                  <h3 className="text-4xl font-bold mt-1">{books.reduce((acc, b) => acc + b.current_page, 0)}</h3>
                </div>
              </GlassCard>
              <GlassCard className="p-8 text-center space-y-4">
                <CheckCircle2 size={32} className="mx-auto text-secondary" />
                <div>
                  <p className="editorial-label text-xs">LENDO AGORA</p>
                  <h3 className="text-4xl font-bold mt-1">{books.filter(b => b.status === 'reading').length}</h3>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <AddBookModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSave={fetchBooks}
      />
    </div>
  );
};

export default Reading;
