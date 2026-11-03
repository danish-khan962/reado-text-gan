import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

// Signed-in users don't need the sign-in / sign-up pages
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <main className='flex min-h-[80vh] items-center justify-center px-4 py-10'>
      {children}
    </main>
  )
}
