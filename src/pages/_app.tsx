import { ThemeProvider } from '@/components/theme-provider'
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
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  )
}
