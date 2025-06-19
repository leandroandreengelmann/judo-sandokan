"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, AuthUser, UserProfile } from "@/lib/supabase";

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: Partial<UserProfile>
  ) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
  getPendingUsers: () => Promise<{ data?: UserProfile[]; error?: string }>;
  approveUser: (userId: string) => Promise<{ error?: string }>;
  isMestre: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        // PGRST116 significa "nenhum registro encontrado" - é esperado para novos usuários
        if (error.code !== "PGRST116") {
          console.error("Erro ao carregar perfil:", error);
        }

        // Se não existe perfil, criar um básico
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          nome_completo: undefined,
          cor_faixa: undefined,
          escola: undefined,
          contato: undefined,
          nivel_usuario: "aluno",
          aprovado: false,
        });
        setLoading(false);
        return;
      }

      // Se o perfil existe, usar os dados
      const userData = {
        id: authUser.id,
        email: authUser.email || "",
        nome_completo: profile?.nome_completo,
        data_nascimento: profile?.data_nascimento,
        altura: profile?.altura,
        peso: profile?.peso,
        escolaridade: profile?.escolaridade,
        cor_faixa: profile?.cor_faixa,
        escola: profile?.escola,
        contato: profile?.contato,
        endereco: profile?.endereco,
        instagram: profile?.instagram,
        facebook: profile?.facebook,
        tiktok: profile?.tiktok,
        tipo_sanguineo: profile?.tipo_sanguineo,
        toma_remedio: profile?.toma_remedio,
        alergico_remedio: profile?.alergico_remedio,
        nome_responsavel: profile?.nome_responsavel,
        endereco_responsavel: profile?.endereco_responsavel,
        cpf_responsavel: profile?.cpf_responsavel,
        contato_responsavel: profile?.contato_responsavel,
        especialidade: profile?.especialidade,
        biografia: profile?.biografia,
        anos_experiencia: profile?.anos_experiencia,
        nivel_usuario: profile?.nivel_usuario || "aluno",
        aprovado: profile?.aprovado || false,
      };
      setUser(userData);
    } catch (error) {
      console.error("Erro inesperado ao carregar perfil:", error);
      // Em caso de erro, definir dados mínimos
      setUser({
        id: authUser.id,
        email: authUser.email || "",
        nome_completo: undefined,
        cor_faixa: undefined,
        escola: undefined,
        contato: undefined,
        nivel_usuario: "aluno",
        aprovado: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<UserProfile>
  ) => {
    try {
      setLoading(true);

      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // Se o usuário foi criado, atualizar o perfil com dados extras
      if (data.user && Object.keys(userData).length > 0) {
        // Aguardar um pouco para o trigger criar o perfil básico
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { error: profileError } = await supabase
          .from("user_profiles")
          .update(userData)
          .eq("id", data.user.id);

        if (profileError) {
          console.error("Erro ao atualizar perfil:", profileError);
          // Não retornar erro aqui, pois o usuário foi criado com sucesso
        }
      }

      return {};
    } catch {
      return { error: "Erro inesperado ao criar conta" };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Personalizar mensagens de erro para português
        if (error.message.includes("Email not confirmed")) {
          return {
            error:
              "📧 Confirme seu email antes de fazer login. Verifique sua caixa de entrada (e spam) e clique no link de confirmação que enviamos.",
          };
        }
        if (error.message.includes("Invalid login credentials")) {
          return {
            error:
              "❌ Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
          };
        }
        return { error: error.message };
      }

      // Verificar se o usuário está aprovado
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("nivel_usuario, aprovado")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          return { error: "Erro ao verificar perfil do usuário" };
        }

        // Se for aluno e não estiver aprovado, bloquear login
        if (profile.nivel_usuario === "aluno" && !profile.aprovado) {
          await supabase.auth.signOut();
          return {
            error:
              "Sua conta ainda não foi aprovada pelo mestre. Aguarde a aprovação.",
          };
        }
      }

      return {};
    } catch {
      return { error: "Erro inesperado ao fazer login" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch {
      return { error: "Erro inesperado ao enviar email de recuperação" };
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: "Usuário não autenticado" };
      }

      const { error } = await supabase
        .from("user_profiles")
        .update(data)
        .eq("id", user.id);

      if (error) {
        return { error: error.message };
      }

      // Atualizar estado local
      setUser((prev) => (prev ? { ...prev, ...data } : null));
      return {};
    } catch {
      return { error: "Erro inesperado ao atualizar perfil" };
    }
  };

  const getPendingUsers = async () => {
    try {
      if (!user?.id) {
        return { error: "Usuário não autenticado" };
      }

      // Usar função PostgreSQL que verifica permissões internamente
      const { data, error } = await supabase.rpc("get_pending_users", {
        requesting_user_id: user.id,
      });

      if (error) {
        return { error: "Erro ao buscar usuários pendentes" };
      }

      return { data };
    } catch {
      return { error: "Erro inesperado ao buscar usuários pendentes" };
    }
  };

  const approveUser = async (userId: string) => {
    try {
      if (!user?.id) {
        return { error: "Usuário não autenticado" };
      }

      // Usar função PostgreSQL que verifica permissões internamente
      const { data, error } = await supabase.rpc("approve_user", {
        requesting_user_id: user.id,
        target_user_id: userId,
      });

      if (error) {
        return { error: "Erro ao aprovar usuário" };
      }

      if (!data) {
        return {
          error: "Falha ao aprovar usuário. Verifique suas permissões.",
        };
      }

      return {};
    } catch {
      return { error: "Erro inesperado ao aprovar usuário" };
    }
  };

  const isMestre = () => {
    return user?.nivel_usuario === "mestre" && user?.aprovado === true;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    getPendingUsers,
    approveUser,
    isMestre,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
