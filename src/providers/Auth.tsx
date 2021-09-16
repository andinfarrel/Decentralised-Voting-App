import { IGunChainReference } from 'gun/types/chain';
import { createContext, Dispatch, FC, SetStateAction } from 'react';
import { db, gunUser } from '@app/lib/database'
import { useEffect, useState } from 'react'

export const AuthContext = createContext<{
  currentUser?: IGunChainReference<Record<string, any>, any, false>
  currentUsername?: string
  setCurrentUser?: Dispatch<SetStateAction<IGunChainReference<Record<string, any>, any, false>>>
  login?: (username: string, password: string) => void,
  signUp?: (username: string, password: string) => void,
  signOut?: () => void,
}>({})

export const AuthProvider: FC = ({children}) => {
  const auth = useProvideAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useProvideAuth = () => {
  const [currentUser, setCurrentUser] = useState(gunUser)
  const [currentUsername, setCurrentUsername] = useState('')

  const login =  (username: string, password: string) => {
    currentUser.auth(username, password, async (ack: any) => {
      if (ack.err) {
        ack.err && alert(ack.err)
      } else {
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
    currentUser.create(username, password, ({ err }: any) => {
      if (err) {
        alert(err);
      } else {
        login(username, password);
      }
    });
  }

  const signOut = () => {
    currentUser.leave()
    setCurrentUsername('')
  }

  useEffect(() => {
    setCurrentUser(gunUser.recall({sessionStorage: true}))
    // @ts-ignore
    db.on('auth', async (event: Event) => {
      const alias = await currentUser.get('alias')
      setCurrentUsername(alias.toString())
    })

    return () => {
      setCurrentUsername('') 
      setCurrentUser(gunUser)
    }
  }, [])

  return {
    currentUser,
    currentUsername,
    setCurrentUser,
    login,
    signUp,
    signOut,
  }
}