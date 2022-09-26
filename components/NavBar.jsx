import React, { useEffect, useState} from 'react';
import Link from 'next/link';
import QuickCart from './QuickCart';
import UserLogin from './UserLogin';
import { useUser } from '@auth0/nextjs-auth0';
import { Grid, Box } from '@mui/material'

const Navbar = () => {

  const { user } = useUser()
  useEffect(() => {
    
  },[])

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <div className="navbar-container">
        <p className="logo">
          <Link href="/">CarLast</Link>
        </p>
        </div>
      </Grid>
      
      <Grid item sm={6}>
        <Box display="flex" justifyContent="flex-end">
          <QuickCart user={user}/>
        </Box>
      </Grid> 
    </Grid>
      
  )
}

export default Navbar 