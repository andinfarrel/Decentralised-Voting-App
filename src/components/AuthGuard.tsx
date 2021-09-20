import Link from 'next/link'
import { useAuth } from '@app/hooks/use-auth'
import { FC, useEffect } from 'react'
import Enter from '@app/pages/enter'
import { gunUser } from '@app/lib/database'

const AuthGuard: FC = ({children}) => {
  const { currentUser, setCurrentUser } = useAuth()


  if (currentUser) {
    return (
      <>
        {children}
      </>
    )
  } else {
    return (
      <Enter />
    )
  }
}

export default AuthGuard