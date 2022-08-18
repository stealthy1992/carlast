import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid'
import { useCarContextProvider } from '../context/CarContextProvider';
import { urlFor } from '../lib/client';
import { Typography } from '@mui/material'
import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router'
import { useEffect } from 'react';

const TAX_RATE = 0.07;

function ccyFormat(num) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty, unit) {
  return qty * unit;
}

function createRow(desc, qty, unit) {
  const price = priceRow(qty, unit);
  return { desc, qty, unit, price };
}

function subtotal(items) {
  return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
}

const rows = [
  createRow('Paperclips (Box)', 100, 1.15),
  createRow('Paper (Case)', 10, 45.99),
  createRow('Waste Basket', 2, 17.99),
];

const invoiceSubtotal = subtotal(rows);
const invoiceTaxes = TAX_RATE * invoiceSubtotal;
const invoiceTotal = invoiceTaxes + invoiceSubtotal;

export default function SpanningTable() {

  const { value, emptyCart } = useCarContextProvider()
  const router = useRouter()
  const { user } = useUser()
  
  useEffect(() => {
    if(!user)
    router.push('/api/auth/login')
  })

  const checkout = (e) => {
    e.preventDefault()
    if(user)
    console.log('exists')
    else
    router.push('/api/auth/login')
  }
  
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '100vh' }}
    >
      <Grid item xs={3}>
      <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="spanning table">
            {value.length > 0 ? (<>
              <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell >Image</TableCell>
                <TableCell align="right">Model Year</TableCell>
                <TableCell align="right">Color</TableCell>
                <TableCell align="right">Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {value.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell><img src={urlFor(row.images && row.images[0])} className="cart-image" /></TableCell>
                  <TableCell align="right">{row.modelyear}</TableCell>
                  <TableCell align="right">{row.color}</TableCell>
                  <TableCell align="right">{ccyFormat(row.price)}</TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell rowSpan={3} />
                <TableCell colSpan={2}>Subtotal</TableCell>
                <TableCell align="right">{ccyFormat(invoiceSubtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tax</TableCell>
                <TableCell align="right">{`${(TAX_RATE * 100).toFixed(0)} %`}</TableCell>
                <TableCell align="right">{ccyFormat(invoiceTaxes)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell align="right">{ccyFormat(invoiceTotal)}</TableCell>
              </TableRow>
            </TableBody>
            <div className="buttons" align="right">
            {/* <button type="button" className="add-to-cart" onClick="">Place Order</button> */}
              <button type="button" className="buy-now" onClick={checkout}>Checkout</button>
              <button type="button" className="buy-now" onClick={() => emptyCart()}>Empty Cart</button>
            </div>
            </>) : <Typography variant="h5">No Product Found</Typography>}
          </Table>
        </TableContainer>
        

      </Grid>   
      
    </Grid>
    
  );
}

// export const getStaticProps = () => {

//   const { user } = useUser()

//   return {
//     props: {
//       user
//     }
//   }
// }