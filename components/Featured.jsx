import React from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions, Grid, Box} from '@mui/material';
import { urlFor } from "../lib/client";
import Link from 'next/link'

const Featured = ({car}) => {
  return (
    <Grid item xs={3}>
        <Box m={3}>
        <Card sx={{ maxWidth: 345 }}>
        {console.log(car)}
      <Link href={ car.price ? `/car-for-sale/${car.slug.current}` : `/car-for-rent/${car.slug.current}`}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={urlFor(car.images[0])}
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {car.name}
          </Typography>
          {car.price ? <Typography variant="body2" color="text.secondary">${car.price}</Typography> : <Typography variant="body2" color="text.secondary">${car.rent} / day</Typography>}
        </CardContent>
      </CardActionArea>
      </Link>
      <CardActions>
      <Link href={car.price ? `/car-for-sale/${car.slug.current}` : `/car-for-rent/${car.slug.current}`}>
        {car.price ? <Button variant="contained" size="small" color="error">Buy Now</Button> : <Button variant="contained" size="small" color="error">Rent Now</Button>}
      </Link>
      </CardActions>
    </Card>
        </Box>
    </Grid>
    
  )
}

export default Featured
