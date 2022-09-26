import React, { useEffect, useState } from 'react'
import { urlFor, client } from '../../lib/client'
import { Grid, Box, ImageList, ImageListItem } from '@mui/material'
import { useCarContextProvider } from '../../context/CarContextProvider'
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';


const CarDetails = ({car}) => {

const { exists, buyOrder, rentOrder, value } = useCarContextProvider()
const { name, images, price, description, transmission, modelyear, manufacturer, registrationyear, mileage, sittingcapacity, color  } = car
const [index, setIndex] = useState(0);
const [toggle, setToggle ] = useState(false)

const placeOrder = () => {
    buyOrder(car)
    setToggle(true)
}

useEffect(() => {
    // rentOrder('value is passed')
},[])

  return (
    <Grid
    container
    spacing={0}
    // direction="column"
    alignItems="center"
    justifyContent="center"
    style={{ minHeight: '100vh' }}
    >
    <Grid item lg={12} md={12} sm={12} xs={12} >
        { toggle && <Stack sx={{ width: '100%' }} spacing={2}>
            <Alert sx={{ mb: 2 }} action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setToggle(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          } severity="success">Your request for car rent has been submitted.</Alert>
        </Stack>}
        { exists === true && <Alert action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setToggle(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          } severity="error">This vehicle already exists in the cart.</Alert>}
    </Grid>
        
    <Grid item lg={6} md={6} sm={12} xs={12} >
        <div className="product-detail-container">
            <div>
            <div className="image-container">
                <img src={urlFor(images && images[index])} className="product-detail-image" />
            </div>
            <div className="small-images-container">
                {images?.map((item, i) => (
                <img 
                    key={i}
                    src={urlFor(item)}
                    className={i === index ? 'small-image selected-image' : 'small-image'}
                    onMouseEnter={() => setIndex(i)}
                />
                ))}
            </div>
            </div>
        </div>
    </Grid>
    <Grid item lg={6} md={6}>
        <div className='product-detail-desc'>
            <h1>{name}</h1>
        </div>
        <Box mt={2}>
            <h4>Details: </h4>
            <p>{description}</p>
        </Box>
        <Box mt={2}>
            <div className='product-detail-desc'>
                <h4>Price: </h4>
                <p className="price">${price}</p>
            </div>
        </Box>
        <Box mt={2}>
            <h4>Transmission: </h4>
            <p>{transmission}</p>
        </Box>
        <Box mt={2}>
            <h4>Model Year: </h4>
            <p>{modelyear}</p>

        </Box>
        <Box mt={2}>
            <h4>Manufacturer: </h4>
            <p>{manufacturer}</p>
        </Box>
       <Box mt={2}>
            <h4>Registration Year: </h4>
            <p>{registrationyear}</p>
       </Box>
        <Box mt={2}>
            <h4>Mileage: </h4>
            <p>{mileage}</p>
        </Box>
        <Box mt={2}>
            <h4>Sitting Capacity: </h4>
            <p>{sittingcapacity}</p>
        </Box>
        <Box mt={2}>
            <h4>Color: </h4>
            <p>{color}</p>
        </Box>
        <div className="buttons">
            {/* <button type="button" className="add-to-cart" onClick="">Place Order</button> */}
            <button type="button" className="buy-now" onClick={() => placeOrder()}>Place Order</button>
        </div>

    </Grid>    
   
</Grid> 
    
  )
}

export const getStaticPaths = async () => {

    const query = `*[_type == "carsforsale"]{slug{
        current
    }}`

    const car = await client.fetch(query)
    const paths = car.map((item) => ({
        params: {
            slug: item.slug.current
        }
    }))

    return{
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps = async ({params: { slug }}) => {

    const query = `*[_type == "carsforsale" && slug.current == '${slug}'][0]`
    const car = await client.fetch(query)

    return{
        props: {
            car
        }
    }
}

export default CarDetails
