'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database.types'

async function buildSupabase() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )
}

export async function login(formData: FormData): Promise<{ error: string } | never> {
  const supabase = await buildSupabase()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'אימייל או סיסמה שגויים' }
  }

  redirect('/')
}

export async function signup(formData: FormData): Promise<{ error: string } | never> {
  const supabase = await buildSupabase()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    return { error: 'שגיאה ביצירת החשבון. נסה שוב.' }
  }

  redirect('/')
}

export async function logout(): Promise<never> {
  const supabase = await buildSupabase()
  await supabase.auth.signOut()
  redirect('/login')
}
