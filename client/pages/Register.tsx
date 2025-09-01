import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: email.split('@')[0] } } })

    if (error) {
      // Se já estiver cadastrado, tenta fazer login diretamente
      if (error.message?.toLowerCase().includes('already') || error.message?.toLowerCase().includes('registrado')) {
        const { error: loginExistingError } = await supabase.auth.signInWithPassword({ email, password })
        setLoading(false)
        if (loginExistingError) {
          toast({ title: 'Erro ao entrar', description: loginExistingError.message, variant: 'destructive' })
          return
        }
        navigate('/')
        return
      }
      const friendly = error.message?.toLowerCase().includes('database error saving new user')
        ? 'Falha ao salvar novo usuário no servidor. Verifique a configuração do Supabase e tente novamente.'
        : error.message
      setLoading(false)
      toast({ title: 'Erro ao cadastrar', description: friendly, variant: 'destructive' })
      return
    }

    // Se confirmação de email estiver habilitada, não haverá sessão após signUp
    if (data?.user && !data.session) {
      setLoading(false)
      toast({
        title: 'Confirme seu email',
        description: 'Enviamos um link de confirmação. Após confirmar, faça login com seu email e senha.',
      })
      navigate('/login')
      return
    }

    // Auto login quando a sessão já vier no cadastro
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (loginError) {
      const msg = loginError.message?.toLowerCase().includes('confirm')
        ? 'Email não confirmado. Verifique sua caixa de entrada e confirme o cadastro.'
        : loginError.message
      toast({ title: 'Erro ao entrar', description: msg, variant: 'destructive' })
      return
    }
    navigate('/')
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
        </form>
        <p className="text-sm text-gray-600 mt-4">Já tem conta? <Link className="text-brand-purple underline" to="/login">Entrar</Link></p>
      </div>
    </Layout>
  )
}
