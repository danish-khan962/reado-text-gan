"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

type Mode = 'sign-in' | 'sign-up'

const COPY = {
  'sign-in': {
    title: 'Welcome back',
    subtitle: 'Sign in to see your summaries and history.',
    cta: 'Sign in',
    pending: 'Signing in…',
    switchText: "Don't have an account?",
    switchLabel: 'Sign up',
    switchHref: '/sign-up',
  },
  'sign-up': {
    title: 'Create your account',
    subtitle: 'Save your summaries and come back to them anytime.',
    cta: 'Create account',
    pending: 'Creating account…',
    switchText: 'Already have an account?',
    switchLabel: 'Sign in',
    switchHref: '/sign-in',
  },
} as const

const inputClass =
  'h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm shadow-none outline-none placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-900'

const AuthForm = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const copy = COPY[mode]
  const isSignUp = mode === 'sign-up'

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pending) return
    setError(null)
    setPending(true)

    const { error } = isSignUp
      ? await authClient.signUp.email({ name: name.trim(), email, password })
      : await authClient.signIn.email({ email, password })

    if (error) {
      setError(error.message || 'Something went wrong. Please try again.')
      setPending(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className='flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-semibold text-neutral-900'>{copy.title}</h1>
        <p className='text-sm text-neutral-500'>{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {isSignUp && (
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='name' className='text-xs font-medium text-neutral-700'>
              Name
            </label>
            <input
              id='name'
              type='text'
              autoComplete='name'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Your name'
              className={inputClass}
            />
          </div>
        )}

        <div className='flex flex-col gap-1.5'>
          <label htmlFor='email' className='text-xs font-medium text-neutral-700'>
            Email
          </label>
          <input
            id='email'
            type='email'
            autoComplete='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='you@example.com'
            className={inputClass}
          />
        </div>

        <div className='flex flex-col gap-1.5'>
          <label htmlFor='password' className='text-xs font-medium text-neutral-700'>
            Password
          </label>
          <input
            id='password'
            type='password'
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignUp ? 'At least 8 characters' : 'Your password'}
            className={inputClass}
          />
        </div>

        {error && (
          <p role='alert' className='text-sm text-red-600'>
            {error}
          </p>
        )}

        <Button type='submit' disabled={pending} className='w-full'>
          {pending && <Loader2 className='h-4 w-4 animate-spin' />}
          {pending ? copy.pending : copy.cta}
        </Button>
      </form>

      <p className='text-center text-sm text-neutral-500'>
        {copy.switchText}{' '}
        <Link
          href={copy.switchHref}
          className='font-medium text-neutral-900 underline-offset-4 hover:underline'
        >
          {copy.switchLabel}
        </Link>
      </p>
    </div>
  )
}

export default AuthForm
