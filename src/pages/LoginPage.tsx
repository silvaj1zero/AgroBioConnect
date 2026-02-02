import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Leaf } from 'lucide-react'

export function LoginPage() {
  const { signInWithEmail, signInWithPassword, signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const { error } = await signInWithEmail(email)
    if (error) setError(error.message)
    else setMessage('Link de acesso enviado para seu e-mail.')
    setLoading(false)
  }

  const handlePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const { error } = await signInWithPassword(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const { error } = await signUp(email, password, fullName)
    if (error) setError(error.message)
    else setMessage('Conta criada. Verifique seu e-mail para confirmar.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-950 via-green-900 to-green-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">AgroBioConnect</CardTitle>
          <CardDescription>Sistema Operacional do Bioinsumo</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 rounded-md bg-primary/10 text-primary text-sm">
              {message}
            </div>
          )}

          <Tabs defaultValue="magic-link">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              <TabsTrigger value="password">Senha</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="magic-link">
              <form onSubmit={handleMagicLink} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="ml-email">E-mail</Label>
                  <Input id="ml-email" name="email" type="email" required placeholder="seu@email.com" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Link de Acesso'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="password">
              <form onSubmit={handlePassword} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="pw-email">E-mail</Label>
                  <Input id="pw-email" name="email" type="email" required placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-pass">Senha</Label>
                  <Input id="pw-pass" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nome Completo</Label>
                  <Input id="reg-name" name="fullName" required placeholder="Maria da Silva" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-mail</Label>
                  <Input id="reg-email" name="email" type="email" required placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pass">Senha</Label>
                  <Input id="reg-pass" name="password" type="password" required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
