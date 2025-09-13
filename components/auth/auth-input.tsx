'use client'

import { useState, ReactNode } from 'react'
import { Input } from '@/components/ui/input'

export function AuthInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  name,
}: {
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  value: string
  onChange: (v: string) => void
  icon?: ReactNode
  name?: string
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <Input
        name={name}
        type={isPassword ? (show ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-14 rounded-2xl bg-muted/40 border-none pr-12 ${icon ? 'pl-12' : ''}`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 px-4 text-sm text-muted-foreground"
          aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {show ? '🙈' : '👁️'}
        </button>
      )}
    </div>
  )
}
