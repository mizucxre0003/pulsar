import { NavLink } from 'react-router-dom'
import { Users, UserRound, User } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Navigation() {
  const links = [
    { to: '/', icon: Users, label: 'Группы' },
    { to: '/friends', icon: UserRound, label: 'Друзья' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-40 pointer-events-none">
      <nav className="glass-panel pointer-events-auto rounded-full flex justify-around items-center px-6 py-3 max-w-md mx-auto shadow-2xl">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end
            className={({ isActive }) =>
              cn("flex flex-col items-center gap-1 transition-colors duration-200 relative",
                isActive ? "text-white" : "text-white/40 hover:text-white/70")
            }>
            {({ isActive }) => (
              <>
                <Icon size={22} />
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full"
                    style={{ boxShadow: '0 0 8px rgba(255,255,255,0.8)' }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
