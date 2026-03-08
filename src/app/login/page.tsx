'use client'

import { useState, useTransition } from 'react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setErrorMsg(null)
    startTransition(async () => {
      const result = mode === 'login' ? await login(formData) : await signup(formData)
      if (result && 'error' in result) {
        setErrorMsg(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Family Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">ניהול משפחתי חכם</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              אימייל
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              placeholder="you@example.com"
              dir="ltr"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              סיסמה
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600 dark:text-red-400 rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 py-2.5 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isPending ? 'טוען...' : mode === 'login' ? 'התחברות' : 'הרשמה'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setErrorMsg(null)
            }}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {mode === 'login' ? 'אין לך חשבון? הרשם כאן' : 'יש לך כבר חשבון? התחבר'}
          </button>
        </div>
      </div>
    </div>
  )
}
