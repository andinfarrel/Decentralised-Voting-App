// import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import { AppProvider } from '@app/providers/App'
import { AuthProvider } from '@app/providers/Auth'


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </AppProvider>
  )
}
export default MyApp
