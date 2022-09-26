import * as React from 'react';
import { Drawer, Grid, Box, Button, Typography } from '@mui/material';
import { AiOutlineShopping, AiOutlineLogin, HiUserCircle } from 'react-icons/ai'
import { useCarContextProvider } from '../context/CarContextProvider'
import { urlFor} from '../lib/client'
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';

import { useState } from 'react';
import { useEffect } from 'react';

export default function QuickCart({user}) {

  const [state, setState] = useState(false);
  const { count, value } = useCarContextProvider()

  return (
    <>
    <Box marginRight={1}>
    <Tooltip title="Cart">
      <button type="button" className="cart-icon" onClick={() => setState(true)}>
            <AiOutlineShopping />
            <span className="cart-item-qty">{count}</span>
      </button>
    </Tooltip>
    
    </Box>
      
      <Box marginRight={1}>
        <button type="button" className="cart-icon">
              <Link href={ user ? "/api/auth/logout" : "/api/auth/login"}>
                  { user ? <Tooltip title="Log Out"><LogoutIcon /></Tooltip> : <Tooltip title="Log In"><LoginIcon /></Tooltip>}
              </Link>
        </button>
      </Box>
          <Drawer
            anchor='right'
            role='presentation'
            open={state}
            onClose={() => setState(false)}
          >
            <Box
              sx={{ width: 350 }}
            >
              {console.log('array received is ',value)}
              { value.length > 0 ? (<Grid
                container
                spacing={0}
                direction="column"
                // alignItems="center"
                // justifyContent="center"
                style={{ minHeight: '100vh' }}
              >
                <Grid item pt={3} ml={2}>
                <div className='products-heading-cart'>
                    <h2>Cart</h2>
                </div>
                </Grid>
                { value?.map((item) => (
                  <>
                  <Grid item pt={3} ml={2}>
                  <div >
                  <img src={urlFor(item.images && item.images[0])} className="cart-image" />
                  </div>
                </Grid>
                
                <Grid item pt={3} ml={2}>
                  <Typography variant='h5'>Car Name:</Typography>
                  <Typography variant='h6'>{item.name}</Typography>
                </Grid>
                <Grid item pt={3} ml={2}>
                  <Typography variant='h5'>Color:</Typography>
                  <Typography variant='h6'>{item.color}</Typography>
                </Grid>
                <Grid item pt={3} ml={2}>
                  <Typography variant='h5'>Price:</Typography>
                  <Typography variant='h6'>{item.price}</Typography>
                </Grid>
                  </>
                ))}
                <Grid item pt={3} ml={2}>
                  <Link href='/cart'>
                    <Button variant='contained' color="error" onClick={() => setState(false)}>Checkout!</Button>
                  </Link>
                  
                </Grid>     
                
              </Grid>) : <Box ml={2} pt={3}><Typography variant="h6">No Items in the cart</Typography></Box>}
            </Box>
          </Drawer>
    </>
  );
}
