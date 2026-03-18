'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-green-400 font-bold text-xl tracking-tight">
          EPiLOG
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-zinc-300 hover:text-green-400 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href={`/users/${user.username}`}
                className="text-zinc-300 hover:text-green-400 transition-colors"
              >
                {user.username}
              </Link>
              <button
                onClick={logout}
                className="text-zinc-400 hover:text-red-400 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-300 hover:text-green-400 transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
