import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const removePhoneMask = (phone: string) => {
    return phone.replace(/\D/g, '');
  };
  const { toast } = useToast();
  const navigate = useNavigate();

  const upsertProfile = async () => {
    const { data: userResp } = await supabase.auth.getUser();
    const user = userResp?.user;
    if (!user) return;
    const meta: any = (user as any).user_metadata || {};
    const safeName =
      fullName ||
      meta.full_name ||
      meta.name ||
      (user.email
        ? user.email.split("@")[0]
        : `Usuario_${user.id.slice(0, 8)}`);
    await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email ?? email,
        full_name: safeName,
        phone: removePhoneMask(phone),
        avatar_url: meta.avatar_url ?? null,
        role: meta.role ?? "student",
      },
      { onConflict: "id" },
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem. Verifique e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: removePhoneMask(phone) } },
    });

    if (error) {
      // Se já estiver cadastrado, tenta fazer login diretamente
      if (
        error.message?.toLowerCase().includes("already") ||
        error.message?.toLowerCase().includes("registrado")
      ) {
        const { error: loginExistingError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (loginExistingError) {
          setLoading(false);
          toast({
            title: "Erro ao entrar",
            description: loginExistingError.message,
            variant: "destructive",
          });
          return;
        }
        await upsertProfile();
        setLoading(false);
        navigate("/");
        return;
      }
      const friendly = error.message
        ?.toLowerCase()
        .includes("database error saving new user")
        ? "Falha ao salvar novo usuário no servidor. Verifique a configuração do Supabase e tente novamente."
        : error.message;
      setLoading(false);
      toast({
        title: "Erro ao cadastrar",
        description: friendly,
        variant: "destructive",
      });
      return;
    }

    // Se confirmação de email estiver habilitada, não haverá sessão após signUp
    if (data?.user && !data.session) {
      setLoading(false);
      toast({
        title: "Confirme seu email",
        description:
          "Enviamos um link de confirmação. Após confirmar, faça login com seu email e senha.",
      });
      navigate("/login");
      return;
    }

    // Auto login quando a sessão já vier no cadastro
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setLoading(false);
      const msg = loginError.message?.toLowerCase().includes("confirm")
        ? "Email não confirmado. Verifique sua caixa de entrada e confirme o cadastro."
        : loginError.message;
      toast({
        title: "Erro ao entrar",
        description: msg,
        variant: "destructive",
      });
      return;
    }
    await upsertProfile();
    setLoading(false);
    navigate("/");
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <span className="text-sm text-red-500">* campos obrigatórios</span>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nome completo <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone <span className="text-red-500">*</span></Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              maxLength={15}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Senha <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar senha <span className="text-red-500">*</span></Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          Já tem conta?{" "}
          <Link className="text-brand-purple underline" to="/login">
            Entrar
          </Link>
        </p>
      </div>
    </Layout>
  );
}
