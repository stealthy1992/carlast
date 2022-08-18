import React, { useEffect, useState } from 'react'
import  Link from 'next/link'
import { AiOutlineLogin, HiUserCircle } from 'react-icons/ai'

const UserLogin = ({user}) => {

    return (
        
        
        <button type="button" className="cart-icon">
             <Link href={ user ? "/api/auth/logout" : "/api/auth/login"}>
                { user ? 'Logout' : 'Login'}
             </Link>
        </button>
    )
}

export default UserLogin
