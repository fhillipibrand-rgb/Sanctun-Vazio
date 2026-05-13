import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  Book, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Library,
  Download,
  Edit2,
  Trash2,
  FileText,
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
  const [bookToEdit, setBookToEdit] = useState<BookItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed' | 'wishlist'>('all');

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

  const deleteBook = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este livro?")) return;
    
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setBooks(books.filter(b => b.id !== id));
    } else {
      alert("Erro ao excluir livro.");
    }
  };

  const handleEdit = (book: BookItem) => {
    setBookToEdit(book);
    setShowAddModal(true);
  };

  const handleAddNew = () => {
    setBookToEdit(null);
    setShowAddModal(true);
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
      Math.round((book.current_page / (book.total_pages || 1)) * 100).toString()
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
              Explore seu acervo literário, organize suas leituras e gerencie seus arquivos PDF com facilidade.
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
              onClick={handleAddNew}
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-surface rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-secondary/20"
            >
              <Plus size={16} /> ADICIONAR LIVRO
            </button>
          </div>
        </div>
      </header>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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

        {activeTab === 'library' && (
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['all', 'reading', 'completed', 'wishlist'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${
                  filter === f 
                    ? 'bg-secondary/10 border-secondary/30 text-secondary' 
                    : 'bg-on-surface/5 border-transparent text-on-surface/40 hover:bg-on-surface/10'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'reading' ? 'Lendo' : f === 'completed' ? 'Lido' : 'Quero Ler'}
              </button>
            ))}
          </div>
        )}
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {books
                .filter(b => filter === 'all' || b.status === filter)
                .map((book) => {
                const progress = (book.current_page / (book.total_pages || 1)) * 100;
                return (
                  <GlassCard key={book.id} className="p-0 border-secondary/5 overflow-hidden flex flex-col h-full group hover:border-secondary/30 transition-all duration-500">
                    <div className="aspect-[3/4.5] bg-on-surface/5 relative overflow-hidden">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-20 bg-gradient-to-br from-on-surface/5 to-on-surface/10">
                          <Book size={48} />
                          <p className="text-[9px] font-bold uppercase tracking-widest">Sem Capa</p>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
                      
                      {/* Badge de Status e Menu de Ações */}
                      <div className="absolute top-4 inset-x-4 flex justify-between items-start">
                        <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                          book.status === 'reading' 
                            ? 'bg-secondary/20 border-secondary/30 text-secondary' 
                            : 'bg-on-surface/20 border-white/10 text-on-surface'
                        }`}>
                          {book.status === 'reading' ? 'Lendo' : book.status === 'completed' ? 'Concluído' : 'Lista de Espera'}
                        </div>
                        <div className="flex gap-1">
                          {book.pdf_url && (
                             <a 
                                href={book.pdf_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-secondary text-surface rounded-lg hover:scale-110 transition-all border border-secondary/30 shadow-lg"
                             >
                                <FileText size={12} />
                             </a>
                          )}
                          <button 
                            onClick={() => handleEdit(book)}
                            className="p-2 bg-surface/40 backdrop-blur-md rounded-lg text-on-surface/60 hover:text-secondary transition-colors border border-white/10"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => deleteBook(book.id)}
                            className="p-2 bg-surface/40 backdrop-blur-md rounded-lg text-on-surface/60 hover:text-red-400 transition-colors border border-white/10"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-surface to-transparent">
                         <div className="flex items-center justify-between gap-2 bg-surface/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl">
                            <button 
                              onClick={() => updateProgress(book.id, Math.max(0, book.current_page - 5))}
                              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-on-surface/10 transition-colors"
                            >
                              -5
                            </button>
                            <div className="flex-1 text-center">
                               <p className="text-[8px] font-bold opacity-40 uppercase">Página</p>
                               <p className="text-xs font-mono font-bold">{book.current_page}</p>
                            </div>
                            <button 
                              onClick={() => updateProgress(book.id, Math.min(book.total_pages, book.current_page + 5))}
                              className="w-8 h-8 rounded-xl flex items-center justify-center bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                            >
                              +5
                            </button>
                         </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-transparent to-on-surface/[0.02]">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-secondary transition-colors line-clamp-2">{book.title}</h3>
                        <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{book.author || 'Autor Desconhecido'}</p>
                      </div>
                      
                      <div className="mt-auto space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                            <span className="opacity-40">Progresso de Leitura</span>
                            <span className="text-secondary">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-secondary" 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] font-mono opacity-40">
                             <Clock size={12} />
                             <span>{book.current_page} / {book.total_pages} pg</span>
                          </div>
                          <button 
                            onClick={() => handleEdit(book)}
                            className="text-[9px] font-bold text-secondary hover:underline tracking-widest uppercase"
                          >
                            DETALHES
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
              {books.length === 0 && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-on-surface/10 rounded-[3rem] opacity-30 flex flex-col items-center gap-4">
                  <Library size={64} strokeWidth={1} />
                  <div>
                    <p className="editorial-label text-sm tracking-[0.3em] font-bold mb-1 uppercase">Sua estante virtual está pronta</p>
                    <p className="text-xs opacity-60">Adicione seu primeiro livro para começar sua jornada intelectual.</p>
                  </div>
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
                <GlassCard key={book.id} className="p-6 border-on-surface/5 flex items-center gap-4 hover:bg-on-surface/[0.03] transition-all group">
                  <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <FileText size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate group-hover:text-secondary transition-colors">{book.title}</h4>
                    <p className="text-[10px] opacity-40 uppercase font-bold truncate">{book.author}</p>
                  </div>
                  <a 
                    href={book.pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary hover:text-surface transition-all"
                  >
                    <ExternalLink size={18} />
                  </a>
                </GlassCard>
              ))}
              {books.filter(b => b.pdf_url).length === 0 && (
                <div className="col-span-full py-20 text-center opacity-20 border-2 border-dashed border-on-surface/10 rounded-3xl">
                  <p className="editorial-label text-xs">Seus arquivos PDF aparecerão aqui.</p>
                </div>
              )}
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
        bookToEdit={bookToEdit}
      />
    </div>
  );
};

export default Reading;
