// import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import type { AppProps } from 'next/app'
import { AppProvider } from '@app/providers/App'
import { AuthProvider } from '@app/providers/Auth'
import AuthGuard from '@app/components/AuthGuard'


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <AuthProvider>
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </AuthProvider>
    </AppProvider>
  )
}
export default MyApp
