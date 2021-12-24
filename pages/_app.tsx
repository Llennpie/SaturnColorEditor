import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <title>Saturn Color Editor</title>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
