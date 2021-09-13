import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import { db, user, UserContext } from '../lib/database'
import { useEffect, useState } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const [username, setUsername] = useState('')

  useEffect(() => {
    // @ts-ignore
    db.on('auth', async (event: Event) => {
      const alias = await user.get('alias')
      setUsername(alias.toString())
    })
  }, [])
  
  return (
    <UserContext.Provider value={{user: user, username: username, setUsername: setUsername}}>
      <Component {...pageProps} />
    </UserContext.Provider>
  )
}
export default MyApp
