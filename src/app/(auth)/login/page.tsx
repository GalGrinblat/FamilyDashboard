'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const nextUrl = searchParams.get('next') || '/';

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${nextUrl}`,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center border rounded-xl p-8 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Family Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">כניסה למערכת ניהול המשפחה</p>
      </div>

      {error === 'unauthorized_email' && (
        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md w-full">
          משתמש זה אינו מורשה להיכנס למערכת. פנה למנהל הרשת.
        </div>
      )}
      {error && error !== 'unauthorized_email' && (
        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md w-full">
          שגיאה בתהליך ההתחברות, אנא נסה שנית.
        </div>
      )}

      <Button
        className="w-full flex items-center justify-center gap-2 h-12 text-base"
        onClick={handleGoogleLogin}
      >
        <LogIn className="w-5 h-5" />
        התחברות עם חשבון גוגל
      </Button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
