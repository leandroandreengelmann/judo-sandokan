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
    // 🔧 FIX: Timeout para evitar loading infinito
    const loadingTimeout = setTimeout(() => {
      console.warn("⏰ Loading timeout - forçando reset do loading state");
      setLoading(false);
    }, 10000); // 10 segundos timeout

    // Buscar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user).finally(() => {
          clearTimeout(loadingTimeout);
        });
      } else {
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    }).catch((error) => {
      console.error("Erro ao buscar sessão:", error);
      setLoading(false);
      clearTimeout(loadingTimeout);
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

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log("🔄 Carregando perfil do usuário:", authUser.id);
      
      // 🔧 FIX: Timeout para evitar travamento na consulta
      const profilePromise = supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout na consulta do perfil")), 8000);
      });

      const { data: profile, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (error) {
        // PGRST116 significa "nenhum registro encontrado" - é esperado para novos usuários
        if (error.code !== "PGRST116") {
          console.error("Erro ao carregar perfil:", error);
        }

        console.log("📝 Criando perfil básico para usuário:", authUser.id);
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
        return;
      }

      console.log("✅ Perfil carregado com sucesso:", profile);
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
      console.error("❌ Erro inesperado ao carregar perfil:", error);
      // 🔧 FIX: Em caso de erro, sempre definir dados mínimos e continuar
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
      // 🔧 FIX: SEMPRE resetar loading, independente do que aconteça
      setLoading(false);
      console.log("🏁 Loading state resetado");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<UserProfile>
  ) => {
    try {
      setLoading(true);

      console.log("=== DEBUG CADASTRO ===");
      console.log("1. Dados recebidos para cadastro:", { email, userData });

      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("2. Erro ao criar usuário:", error);
        return { error: error.message };
      }

      console.log("3. Usuário criado com sucesso:", data.user?.id);

      // Se o usuário foi criado, atualizar o perfil com dados extras
      if (data.user && Object.keys(userData).length > 0) {
        console.log("4. Aguardando trigger criar perfil básico...");
        // Aguardar um pouco para o trigger criar o perfil básico
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Aumentei para 2 segundos

        console.log("5. Atualizando perfil com dados do usuário...");

        // Primeiro, tentar usar função especial que bypassa RLS
        console.log("6. Dados para função update_profile_on_signup:", userData);

        const { data: updateData, error: profileError } = await supabase.rpc(
          "update_profile_on_signup",
          {
            user_id: data.user.id,
            profile_data: userData,
          }
        );

        if (profileError) {
          console.error("7. Erro ao atualizar perfil via RPC:", profileError);
          console.log("8. Tentando update direto como fallback...");

          // Fallback: tentar update direto
          const { error: directUpdateError } = await supabase
            .from("user_profiles")
            .update(userData)
            .eq("id", data.user.id);

          if (directUpdateError) {
            console.error(
              "9. Erro no update direto também:",
              directUpdateError
            );
            console.error("Detalhes completos:", {
              message: directUpdateError.message,
              details: directUpdateError.details,
              hint: directUpdateError.hint,
              code: directUpdateError.code,
            });
            // Não retornar erro aqui, pois o usuário foi criado com sucesso
          } else {
            console.log("9. Update direto funcionou como fallback!");
          }
        } else {
          console.log("8. Perfil atualizado com sucesso via RPC:", updateData);
        }
      }

      console.log("9. Cadastro finalizado com sucesso!");
      return {};
    } catch (error) {
      console.error("10. Erro inesperado durante cadastro:", error);
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
          setLoading(false); // 🔧 FIX: Resetar loading em caso de erro de perfil
          return { error: "Erro ao verificar perfil do usuário" };
        }

        // Se for aluno e não estiver aprovado, bloquear login
        if (profile.nivel_usuario === "aluno" && !profile.aprovado) {
          await supabase.auth.signOut();
          setLoading(false); // 🔧 FIX: Resetar loading antes de retornar
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

      console.log("🔄 Iniciando atualização de perfil...");
      console.log("📝 Dados recebidos:", data);

      // Limpar e validar dados antes de enviar
      const cleanData: Record<string, string | number> = {};

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Tratamento especial para campos numéricos
          if (
            key === "altura" ||
            key === "peso" ||
            key === "anos_experiencia"
          ) {
            const numValue =
              typeof value === "string" ? parseFloat(value) : (value as number);
            if (!isNaN(numValue) && numValue > 0) {
              cleanData[key] = numValue;
            }
          } else {
            // Campos de texto - trim e verificar se não está vazio
            const strValue =
              typeof value === "string" ? value.trim() : String(value);
            if (strValue && strValue !== "") {
              cleanData[key] = strValue;
            }
          }
        }
      });

      console.log("🧹 Dados limpos para envio:", cleanData);

      const { error } = await supabase
        .from("user_profiles")
        .update(cleanData)
        .eq("id", user.id);

      if (error) {
        console.error("❌ Erro do Supabase:", error);
        console.error("📋 Detalhes do erro:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return { error: `Erro ao atualizar perfil: ${error.message}` };
      }

      console.log("✅ Perfil atualizado com sucesso!");

      // Atualizar estado local
      setUser((prev) => (prev ? { ...prev, ...cleanData } : null));
      return {};
    } catch (error) {
      console.error("❌ Erro inesperado ao atualizar perfil:", error);
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
