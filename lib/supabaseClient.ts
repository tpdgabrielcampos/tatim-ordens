import { createClient } from "@supabase/supabase-js";

// Cliente para uso no browser (formulário público). Usa a chave "anon",
// que só tem permissão de INSERT em pedidos/pedido_fotos e upload no bucket
// de fotos, conforme as políticas de RLS definidas em supabase/schema.sql.
//
// Cai para um placeholder quando a variável de ambiente não está definida
// (ex: build antes de configurar no Vercel), pra não quebrar o build.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
