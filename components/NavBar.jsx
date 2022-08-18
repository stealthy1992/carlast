import React, { useEffect, useState} from 'react';
import Link from 'next/link';
import QuickCart from './QuickCart';
import UserLogin from './UserLogin';
import { useUser } from '@auth0/nextjs-auth0';

const Navbar = () => {

  const { user } = useUser()
  useEffect(() => {
    
  },[])

  return (
    <>
      <div className="navbar-container">
      <p className="logo">
        <Link href="/">JSM Headphones</Link>
      </p>
      <QuickCart user={user}/>
      </div>
      
      {/* <UserLogin user={user}/> */}
    </>
  )
}

export default Navbar 