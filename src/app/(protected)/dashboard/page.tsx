import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import DashboardView from '@/modules/dashboard/view/dashboard-view'

const DashboardPage = async () => {
  const session = await getSession()
  if (!session) redirect('/sign-in')

  return <DashboardView />
}

export default DashboardPage