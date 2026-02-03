import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import {
  LayoutDashboard,
  Leaf,
  MapPin,
  QrCode,
  FileCheck,
  LogOut,
  Plus,
  Factory,
  FlaskConical,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/products', label: 'Produtos', icon: Leaf },
  { to: '/fields', label: 'Talhões', icon: MapPin },
  { to: '/batches', label: 'Lotes', icon: FlaskConical },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/traceability', label: 'QR Codes', icon: QrCode },
  { to: '/compliance', label: 'Conformidade', icon: FileCheck },
]

export function Sidebar() {
  const { signOut, profile } = useAuth()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b">
        <Leaf className="h-7 w-7 text-primary" />
        <span className="text-lg font-bold text-primary">AgroBio</span>
      </div>

      {/* CTA */}
      <div className="px-3 pt-4 pb-2">
        <Button asChild className="w-full gap-2">
          <Link to="/biofactory/new">
            <Plus className="h-4 w-4" />
            Registrar Biofábrica
          </Link>
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name ?? 'Usuário'}</p>
            <p className="text-xs text-muted-foreground capitalize">{profile?.role ?? ''}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}
