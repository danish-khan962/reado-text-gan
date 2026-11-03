import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

// Every page inside (protected) requires a signed-in user
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/sign-in')

  return <>{children}</>
}
