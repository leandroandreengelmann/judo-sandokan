import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para autenticação
export interface UserProfile {
  id: string;
  email: string;
  nome_completo?: string;
  data_nascimento?: string;
  altura?: number;
  peso?: number;
  escolaridade?: string;
  cor_faixa?: string;
  escola?: string;
  contato?: string;
  endereco?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  tipo_sanguineo?: string;
  toma_remedio?: string;
  alergico_remedio?: string;
  nome_responsavel?: string;
  endereco_responsavel?: string;
  cpf_responsavel?: string;
  contato_responsavel?: string;
  especialidade?: string;
  biografia?: string;
  anos_experiencia?: number;
  nivel_usuario: "mestre" | "aluno";
  aprovado: boolean;
  data_aprovacao?: string;
  aprovado_por?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nome_completo?: string;
  data_nascimento?: string;
  altura?: number;
  peso?: number;
  escolaridade?: string;
  cor_faixa?: string;
  escola?: string;
  contato?: string;
  endereco?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  tipo_sanguineo?: string;
  toma_remedio?: string;
  alergico_remedio?: string;
  nome_responsavel?: string;
  endereco_responsavel?: string;
  cpf_responsavel?: string;
  contato_responsavel?: string;
  especialidade?: string;
  biografia?: string;
  anos_experiencia?: number;
  nivel_usuario: "mestre" | "aluno";
  aprovado: boolean;
}
