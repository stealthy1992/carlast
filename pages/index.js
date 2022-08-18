import { 
  Card, 
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button } from "@mui/material";

import { client } from "../lib/client";
import { urlFor } from "../lib/client";
import Featured from '../components/Featured'
import FooterBanner from "../components/FooterBanner";
import { useEffect } from "react";
import { useCarContextProvider } from "../context/CarContextProvider";

export default function Home({banner, saleCars, rentCars}) {

const { value, buyOrder } = useCarContextProvider()

useEffect(() => {
  console.log(value)
},[])

return (
  <>

    <div className='hero-banner-container'>
      <div>
        <p className='beats-solo'>{banner[0].smallText}</p>
        <h3>{banner ? banner[0].midText : 'Sample Text'}</h3>
        <h1>{banner[0].largeText1}</h1>
        <img src={urlFor(banner[0].image)} alt="headphones" className='hero-banner-image'/>
        <div>
          {/* <Link href={`/product/${banner.product}`}> */}
            <button type="button">{banner[0].buttonText}</button>
          {/* </Link> */}
          <div className='desc'>
            <h5>Description</h5>
            <p>{banner[0].largeText1}</p>

          </div>
        </div>
      </div>
      
    </div>
    <div className='products-heading'>
        <h2>Purchase your dream car</h2>
    </div>
    <Grid
      container
      spacing={0}
      // direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '30vh' }}
    >
      <div className='products-container'>
      {saleCars.map((car) => <Featured key={car._id} car={car}/>)} 
      </div>
    </Grid>
    <div className='products-heading'>
        <h2>Rent a car of your choice</h2>
    </div>
    <Grid
      container
      spacing={0}
      // direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '30vh' }}
    >
      <div className='products-container'>
      {rentCars.map((car) => <Featured key={car._id} car={car}/>)} 
      </div>
    </Grid> 
    <FooterBanner />
  </>
  
  

  )
}

export const getServerSideProps = async () => {

  const query = '*[_type == "banner"]'
  const banner = await client.fetch(query)

  const saleQuery = '*[_type == "carsforsale"]'
  const saleCars = await client.fetch(saleQuery)

  const rentQuery = '*[_type == "carsforrent"]'
  const rentCars = await client.fetch(rentQuery)

  console.log(rentCars)

  return {
    props: {
      banner,
      saleCars,
      rentCars

    }
  }

}