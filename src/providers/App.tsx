import { db } from '@app/lib/database'
import ErrorPage from '@app/pages/_error'
import { IGunChainReference } from 'gun/types/chain'
import React, { createContext, Dispatch, FC, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AppContext = createContext<{
  appStatus?: AppStatus
  appReady?: boolean
  currentUser?: IGunChainReference<Record<string, any>, any, false>
  currentUsername?: string
  setCurrentUsername?: Dispatch<SetStateAction<string>>
  currentPriv?: string
  setCurrentPriv?: Dispatch<SetStateAction<string>>
}>({})

enum AppStatus {
  IDLE = 'idle',
  SETUP_APP = 'setupApp',
  READY = 'ready',
  ERRORED = 'erroed'
}

const useAppStore = () => {
  const appStore = useContext(AppContext)
  if (!appStore) throw new Error('useAppStore must be used within the AppProvider')
  return appStore
}



const AppProvider: FC = ({
  children
}) => {
  const [appStatus, setAppStatus] = useState(AppStatus.READY)
  const appReady = useMemo(() => appStatus === AppStatus.READY, [appStatus])
  const [currentUser, setCurrentUser] = useState<IGunChainReference<Record<string, any>, any, false>>(db.user())
  const [currentUsername, setCurrentUsername] = useState('')
  const [currentPriv, setCurrentPriv] = useState('')

  useEffect(() => {
    setCurrentUser(db.user().recall({ sessionStorage: true }))
    console.log(currentUser)
    // @ts-ignore
    db.on('auth', async (event: Event) => {
      const alias = await currentUser.get('alias')
      setCurrentUsername(alias.toString())
    })
 
  }, [])

  return (
    <AppContext.Provider
      value={{
        appStatus,
        appReady,
        currentUser: currentUser,
        currentUsername: currentUsername,
        setCurrentUsername: setCurrentUsername,
        currentPriv,
        setCurrentPriv
      }}
    >
      {(() => {
        switch (appStatus) {
          case AppStatus.ERRORED:
            return <ErrorPage statusCode={500} />
          default:
            return children
        }
      })()}
    </AppContext.Provider>
  )
}

export { AppContext, AppStatus, useAppStore, AppProvider }