import { getCurrentUserProfile } from './database'
import type { UserRole } from '@/types/database'
import { redirect } from 'next/navigation'

// Role hierarchy: admin > member > user
export const ROLE_HIERARCHY = {
  admin: 3,
  member: 2,
  user: 1
}

// Check if user has minimum required role
export async function requireRole(minRole: UserRole, redirectUrl = '/dashboard') {
  const profile = await getCurrentUserProfile()
  
  if (!profile) {
    redirect('/auth/signin')
  }
  
  const userLevel = ROLE_HIERARCHY[profile.role]
  const requiredLevel = ROLE_HIERARCHY[minRole]
  
  if (userLevel < requiredLevel) {
    redirect(redirectUrl)
  }
  
  return profile
}

// Specific role checkers
export const requireAdmin = (redirectUrl?: string) => requireRole('admin', redirectUrl)
export const requireMember = (redirectUrl?: string) => requireRole('member', redirectUrl)
export const requireUser = (redirectUrl?: string) => requireRole('user', redirectUrl)

// Check if user can access content from a specific country
export async function requireCountryAccess(countryId: string, redirectUrl = '/dashboard') {
  const profile = await getCurrentUserProfile()
  
  if (!profile) {
    redirect('/auth/signin')
  }
  
  // Admin can access all countries
  if (profile.role === 'admin') {
    return profile
  }
  
  // Member/User can only access their own country
  if (profile.country_id !== countryId) {
    redirect(redirectUrl)
  }
  
  return profile
}

// Wrapper for pages that need authentication
export async function requireAuth() {
  const profile = await getCurrentUserProfile()
  
  if (!profile) {
    redirect('/auth/signin')
  }
  
  return profile
}
