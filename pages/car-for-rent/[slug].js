import React, {useState} from 'react'
import { urlFor, client } from '../../lib/client'
import { Grid, Box } from '@mui/material'


const CarDetails = ({car}) => {
  
    const { name, images, rent, description, transmission, modelyear, manufacturer, registrationyear, mileage, sittingcapacity, color  } = car
    const [index, setIndex] = useState(0);
    
      return (
        <Grid
        container
        spacing={0}
        // direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '100vh' }}
        >
    
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
                    <h4>Rent per day:</h4>
                    <p className="price">${rent}</p>
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
                <button type="button" className="buy-now" onClick="">Apply for Rent</button>
            </div>
    
        </Grid>    
       
    </Grid> 
        
)
}

export const getStaticPaths = async () => {

    const query = `*[_type == "carsforrent"]{slug{
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

    const query = `*[_type == "carsforrent" && slug.current == '${slug}'][0]`
    const car = await client.fetch(query)

    console.log(car)

    return{
        props: {
            car
        }
    }
}

export default CarDetails
