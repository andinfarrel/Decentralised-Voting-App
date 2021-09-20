import { IGunChainReference } from 'gun/types/chain';
import { createContext, Dispatch, FC, SetStateAction } from 'react';
import { db, gunUser } from '@app/lib/database'
import { useEffect, useState } from 'react'

export const AuthContext = createContext<{
  currentUser?: CurrentUser
  setCurrentUser?: Dispatch<SetStateAction<CurrentUser>>
  login?: (username: string, password: string) => void,
  signUp?: (username: string, password: string) => void,
  signOut?: () => void,
}>({})

export const AuthProvider: FC = ({children}) => {
  const auth = useProvideAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

interface CurrentUser {
  alias: string

}

export const useProvideAuth = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>()

  const login =  (username: string, password: string) => {
    gunUser.recall({sessionStorage: true}).auth(username, password, async (ack: any) => {
      if (ack.err) {
        ack.err && alert(ack.err)
      } else {
        // @ts-ignore
        const alias = gunUser.alias
        setCurrentUser({alias: alias})
        console.log('successful login!')
      }
    })
  }

  const signUp = (username: string, password: string) => {
    if (username.length < 4) {
      alert('usernameForm too short! minimun 4 char')
      return
    }
    if (password.length < 8) {
      alert('passwordForm too short! minimum 8 char')
      return
    }
    gunUser.recall({sessionStorage: true}).create(username, password, ({ err }: any) => {
      if (err) {
        alert(err);
      } else {
        login(username, password);
      }
    });
  }

  const signOut = () => {
    gunUser.leave()
    setCurrentUser(null)
  }

  useEffect(() => {

    const u = gunUser.recall({sessionStorage: true})
    setCurrentUser({
      // @ts-ignore
      alias: u.alias
    })
    console.log(currentUser)

    return () => {
      db.off()
      setCurrentUser(null)
    }
  }, [])

  return {
    currentUser,
    setCurrentUser,
    login,
    signUp,
    signOut,
  }
}