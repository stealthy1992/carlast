import React from 'react'
import Head from 'next/head'
import NavBar from './NavBar'

const Layout = ({children}) => {
  return (
    <div className='layout'>
        <Head>
            <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css' integrity='sha512-42kB9yDlYiCEfx2xVwq0q7hT4uf26FUgSIZBK8uiaEnTdShXjwr8Ip1V4xGJMg3mHkUt9nNuTDxunHF0/EgxLQ==' crossOrigin='anonymous' referrerPolicy='no-referrer' />
            <title>Car Last</title>
        </Head>
        <header>
            <NavBar />
        </header>
        <main className='main-container'>
            {children}
        </main>
        <footer>
            Footer
        </footer>
      
    </div>
  )
}

export default Layout
