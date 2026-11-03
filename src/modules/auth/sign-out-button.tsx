"use client"

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

// Drop this into your navbar
const SignOutButton = () => {
  const router = useRouter()

  return (
    <Button
      type='button'
      variant='secondary'
      size='sm'
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push('/sign-in')
              router.refresh()
            },
          },
        })
      }
      className='text-neutral-500 hover:text-neutral-900'
    >
      <LogOut className='h-3.5 w-3.5' />
      Sign out
    </Button>
  )
}

export default SignOutButton
