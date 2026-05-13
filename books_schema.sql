-- 1. Criar a tabela 'books'
CREATE TABLE IF NOT EXISTS public.books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    total_pages INTEGER DEFAULT 0,
    current_page INTEGER DEFAULT 0,
    status TEXT DEFAULT 'reading' CHECK (status IN ('reading', 'completed', 'wishlist')),
    genre TEXT,
    notes TEXT,
    cover_url TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS na tabela 'books'
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para a tabela 'books'
CREATE POLICY "Users can view own books" ON public.books
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own books" ON public.books
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" ON public.books
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own books" ON public.books
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Configurar Storage para PDFs
-- Inserir o bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-pdfs', 'book-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Políticas para o Bucket 'book-pdfs'
-- Permitir que usuários façam upload de seus próprios arquivos
CREATE POLICY "Users can upload their own PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'book-pdfs' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que usuários visualizem seus próprios arquivos
CREATE POLICY "Users can view their own PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'book-pdfs' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que usuários excluam seus próprios arquivos
CREATE POLICY "Users can delete their own PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'book-pdfs' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
