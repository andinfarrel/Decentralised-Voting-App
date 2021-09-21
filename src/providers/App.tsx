import ErrorPage from '@app/pages/_error'
import React, { createContext, FC,useCallback,useContext, useMemo, useState } from 'react'

const AppContext = createContext<{
  appStatus?: AppStatus
  appReady?: boolean
  setAppStatus?: React.Dispatch<React.SetStateAction<AppStatus>>
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


  return (
    <AppContext.Provider
      value={{
        appStatus,
        appReady,
        setAppStatus,
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