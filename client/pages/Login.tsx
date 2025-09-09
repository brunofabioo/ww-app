import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const redirectTo = location.state?.from || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      toast({
        title: "Erro ao entrar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    // Garante que o perfil exista na tabela users
    try {
      const { data: userResp } = await supabase.auth.getUser();
      const user = userResp?.user;
      if (user) {
        const meta: any = (user as any).user_metadata || {};
        const safeName =
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
            avatar_url: meta.avatar_url ?? null,
            role: meta.role ?? "student",
          },
          { onConflict: "id" },
        );
      }
    } catch {}
    setLoading(false);
    navigate("/", { replace: true });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-center mb-6">
          <img 
            src="/logo_01.webp" 
            alt="WordWise Logo" 
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-2xl font-bold mb-4">Entrar</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          Não tem conta?{" "}
          <Link className="text-brand-purple underline" to="/register">
            Cadastre-se
          </Link>
        </p>
      </div>
    </Layout>
  );
}
