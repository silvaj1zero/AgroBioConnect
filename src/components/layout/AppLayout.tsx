import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { PWAInstallBanner } from '@/components/PWAInstallBanner'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col border-r bg-sidebar">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="md:pl-64 pb-16 md:pb-0">
        <div className="mx-auto max-w-7xl p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-background">
        <BottomNav />
      </nav>

      <PWAInstallBanner />
    </div>
  )
}
