import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Leaf,
  MapPin,
  FlaskConical,
  QrCode,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/products', label: 'Produtos', icon: Leaf },
  { to: '/fields', label: 'Talhões', icon: MapPin },
  { to: '/batches', label: 'Lotes', icon: FlaskConical },
  { to: '/traceability', label: 'QR', icon: QrCode },
]

export function BottomNav() {
  return (
    <div className="flex items-center justify-around h-16 px-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] text-xs transition-colors ${
              isActive ? 'text-primary font-medium' : 'text-muted-foreground'
            }`
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  )
}
