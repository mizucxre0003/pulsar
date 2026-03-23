import { NavLink } from 'react-router-dom'
import { Home, Users, User, PlaySquare } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Navigation() {
  const links = [
    { to: '/', icon: Home, label: 'Canvas' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/watch', icon: PlaySquare, label: 'Watch' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
      <nav className="glass-panel pointer-events-auto rounded-full flex justify-between items-center px-6 py-3 max-w-md mx-auto shadow-2xl">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-colors duration-200 relative",
                isActive ? "text-white" : "text-white/40 hover:text-white/70"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={24} />
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
