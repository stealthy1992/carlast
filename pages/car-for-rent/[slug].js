import React, {useState, useRef } from 'react'
import { urlFor, client } from '../../lib/client'
import { Grid, Box } from '@mui/material'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField'
import SendIcon from '@mui/icons-material/Send';
import { useCarContextProvider } from '../../context/CarContextProvider';
import emailjs from '@emailjs/browser';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };


const CarDetails = ({car}) => {
  
    const { name, images, rent, description, transmission, modelyear, manufacturer, registrationyear, mileage, sittingcapacity, color  } = car
    const [index, setIndex] = useState(0);
    const { rentOrder } = useCarContextProvider()
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [ rentDays, setRentDays ] = useState(1)
    const [customerName, setCustomerName] = useState('')
    const [ phone, setPhone ] = useState('')
    const [ emailContent, setEmailContent ] = useState({})
    const form = useRef();
    const carName = car.name
    const [toggle, setToggle] = useState(false)
    // const [ carName, setCar ] = useState('')



    const handleChange = (e) => {
        setRentDays(e.target.value)
    }

    const rentRequest = (e) => {
        e.preventDefault();
        
        console.log(form.current)

       
        emailjs.sendForm('service_uf9ag5o', 'template_17dsupo', form.current, 'UySAhWFeSTmKYEk37')
      .then((result) => {
          console.log(result.text);
          setOpen(false)
          setToggle(true)
      }, (error) => {
          console.log(error.text);
      });


    }

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
            } severity="success">Item added to the Cart</Alert>
            </Stack>}
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
                <button type="button" className="buy-now" onClick={handleOpen}>Apply for Rent</button>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    alignItems="center"
                    justifyContent="center"
                >
                    <form ref={form} onSubmit={rentRequest}>

                    <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Text in a modal
                    </Typography>
                    <Box marginBottom={2}>
                        <TextField name="customerName" id="outlined-basic" label="Full Name" variant="outlined" required onChange={(e) => setCustomerName(e.target.value)}/>
                    </Box>
                    <Box marginBottom={2}>
                        <TextField name="phone" id="outlined-basic" label="Phone Number" variant="outlined" required onChange={(e) => setPhone(e.target.value)} /> 
                    </Box>
                    <Box marginBottom={2}>
                        {/* <TextField  name="carName" id="outlined-basic" label="Car Name" variant="outlined" onChange={(e) => setCar(e.target.value)} />  */}
                        <TextField name="carName" id="outlined-basic" label="Car Name" variant="outlined" value={carName} InputProps={{readOnly: true}}/> 
                    </Box>
                    <Box marginBottom={2}>
                        <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label" required>Rent Days</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={rentDays}
                                label="Number of Days"
                                onChange={handleChange}
                                name="rentDays"
                            >
                                
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={2}>2</MenuItem>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={4}>4</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box marginBottom={2}>
                    <input type="submit" value="Submit"/>
                    
                    {/* <Button typ variant="contained" endIcon={<SendIcon />} onSubmit={rentRequest}>Submit</Button> */}
                    </Box>
                    
                    
                    
                    </Box>


                    </form>
    
                    
                </Modal>
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
