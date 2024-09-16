import { ThemeProvider } from '@/components/theme-provider'
import { AppProvider } from '@/contexts/app.context'
import { AuthProvider } from '@/contexts/auth.context'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      defaultTheme="system"
      attribute="class"
      enableSystem
      // disableTransitionOnChange
    >
      <AuthProvider>
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
