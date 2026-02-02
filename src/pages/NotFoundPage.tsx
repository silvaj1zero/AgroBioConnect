import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">Página não encontrada</p>
      <Button asChild className="mt-6">
        <Link to="/dashboard">Voltar ao Painel</Link>
      </Button>
    </div>
  )
}
