const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.argv[2];

if (!supabaseUrl || !serviceKey) {
  console.error("Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_KEY não encontrados.");
  console.log("Uso: node setup_supabase.js SUA_CHAVE_SERVICE_ROLE");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function setup() {
  console.log("🚀 Iniciando configuração do Supabase...");

  // 1. Criar Bucket
  console.log("📁 Criando bucket 'book-pdfs'...");
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('book-pdfs', {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ['application/pdf']
  });

  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log("✅ Bucket 'book-pdfs' já existe.");
    } else {
      console.error("❌ Erro ao criar bucket:", bucketError.message);
    }
  } else {
    console.log("✅ Bucket 'book-pdfs' criado com sucesso!");
  }

  // 2. Tabela Books (via RPC ou direto se possível, mas DDL via service key é limitado na API JS)
  // Nota: A API JS não permite CREATE TABLE. Isso deve ser feito via SQL Editor.
  console.log("\n⚠️  Lembrete: A criação da tabela 'books' deve ser feita no SQL Editor do Supabase.");
  console.log("Use o arquivo 'books_schema.sql' que já criei no seu projeto.");
  
  console.log("\n✨ Processo finalizado!");
}

setup();
