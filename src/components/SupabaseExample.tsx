import React, { useState } from 'react'
import { useAuth, useSupabaseQuery, useSupabaseInsert } from '../hooks/useSupabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Loader2, Database, User, Plus, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'

// Exemplo de tipo para uma tabela
interface ExampleRecord {
  id: number
  title: string
  description: string
  created_at: string
}

export function SupabaseExample() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')

  // Exemplo de consulta (substitua 'example_table' pelo nome da sua tabela)
  const { data: records, loading: queryLoading, error: queryError, refetch } = useSupabaseQuery<ExampleRecord>(
    'example_table',
    undefined,
    []
  )

  // Exemplo de inserção
  const { insert, loading: insertLoading, error: insertError } = useSupabaseInsert<ExampleRecord>('example_table')

  const handleInsert = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      return
    }

    try {
      await insert({
        title: newTitle,
        description: newDescription
      })
      setNewTitle('')
      setNewDescription('')
      refetch() // Atualizar a lista
    } catch (error) {
      console.error('Erro ao inserir:', error)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando autenticação...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Exemplo de Integração Supabase
          </CardTitle>
          <CardDescription>
            Demonstração de como usar o Supabase na aplicação WordWise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Autenticação */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Status da Autenticação:</span>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Badge variant="default">Conectado</Badge>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    Sair
                  </Button>
                </>
              ) : (
                <Badge variant="secondary">Não autenticado</Badge>
              )}
            </div>
          </div>

          {/* Configuração */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuração necessária:</strong>
              <br />
              1. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
              <br />
              2. Crie uma tabela 'example_table' no seu projeto Supabase com colunas: id, title, description, created_at
              <br />
              3. Configure as políticas RLS (Row Level Security) conforme necessário
            </AlertDescription>
          </Alert>

          {/* Formulário de Inserção */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Adicionar Novo Registro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Título"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Input
                placeholder="Descrição"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleInsert} 
              disabled={insertLoading || !newTitle.trim() || !newDescription.trim()}
              className="w-full md:w-auto"
            >
              {insertLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Adicionar Registro
            </Button>
            {insertError && (
              <Alert variant="destructive">
                <AlertDescription>Erro ao inserir: {insertError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Lista de Registros */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Registros da Tabela</h3>
            {queryLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando dados...</span>
              </div>
            ) : queryError ? (
              <Alert variant="destructive">
                <AlertDescription>Erro ao carregar dados: {queryError}</AlertDescription>
              </Alert>
            ) : records.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                Nenhum registro encontrado. Adicione alguns registros para começar!
              </div>
            ) : (
              <div className="grid gap-3">
                {records.map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{record.title}</h4>
                        <p className="text-sm text-muted-foreground">{record.description}</p>
                      </div>
                      <Badge variant="outline">
                        ID: {record.id}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Criado em: {new Date(record.created_at).toLocaleString('pt-BR')}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Atualizar */}
          <Button variant="outline" onClick={refetch} disabled={queryLoading}>
            {queryLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Atualizar Dados
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}