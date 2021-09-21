import { useAuth } from '@app/hooks/use-auth'
import { FC } from 'react'
import Enter from '@app/pages/enter'

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