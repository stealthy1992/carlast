import '../styles/globals.css'
import Layout from '../components/Layout'
import NProgress from 'nprogress'
import Router from 'next/router'
import { CarContextProvider } from '../context/CarContextProvider'
import { UserProvider } from '@auth0/nextjs-auth0';

function MyApp({ Component, pageProps }) {

  NProgress.configure({ showSpinner: false})
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })

  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })

  return <UserProvider>
          <CarContextProvider>
                  <Layout>
                
                    <Component {...pageProps} />
                
                  </Layout>
          </CarContextProvider>
        </UserProvider> 
        
        
}

export default MyApp
