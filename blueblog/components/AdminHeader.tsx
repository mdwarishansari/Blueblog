'use client'

import { useState } from 'react'
import { Menu, Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User as UserType } from '@prisma/client'
import { ThemeToggle } from '@/components/theme-toggle'

interface AdminHeaderProps {
  user: Pick<UserType, 'name' | 'role'>
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="bg-background text-foreground border-b mt-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="hidden md:block relative w-64 ml-5 pb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 border-gray-300 focus:border-primary-300 focus:ring-primary-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
      <ThemeToggle />
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400" />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 border-gray-300 focus:border-primary-300 focus:ring-primary-300"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}