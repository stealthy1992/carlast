import React, { useState } from 'react'
import { urlFor, client } from '../../lib/client'
import { Grid, Box } from '@mui/material'
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField'
import { useCarContextProvider } from '../../context/CarContextProvider';
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

const CarDetails = ({ car }) => {

  const { name, images, rent, description, transmission, modelyear, manufacturer, registrationyear, mileage, sittingcapacity, color } = car
  const [index, setIndex] = useState(0);
  const { rentOrder } = useCarContextProvider()
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [rentDays, setRentDays] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [toggle, setToggle] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const carName = car.name

  const handleChange = (e) => {
    setRentDays(e.target.value)
  }


const rentRequest = async (e) => {
  e.preventDefault()

  if (!customerName.trim() || !phone.trim()) return

  setSubmitting(true)

  try {
    const res = await fetch('/api/submit-rent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        phone,
        carName,
        rentDays,
      }),
    })

    if (!res.ok) throw new Error('Submission failed')

    setOpen(false)
    setToggle(true)
    setCustomerName('')
    setPhone('')
    setRentDays(1)

  } catch (err) {
    console.error('Submission error:', err)
  } finally {
    setSubmitting(false)
  }
}

  return (
    <Grid
      container
      spacing={0}
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '100vh' }}
    >
      <Grid item lg={12} md={12} sm={12} xs={12}>
        {toggle && (
          <Stack sx={{ width: '100%' }} spacing={2}>
            <Alert
              sx={{ mb: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setToggle(false)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              severity="success"
            >
              Your request for renting this car has been submitted.
            </Alert>
          </Stack>
        )}
      </Grid>

      <Grid item lg={6} md={6} sm={12} xs={12}>
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
        <Box mt={2}><h4>Transmission: </h4><p>{transmission}</p></Box>
        <Box mt={2}><h4>Model Year: </h4><p>{modelyear}</p></Box>
        <Box mt={2}><h4>Manufacturer: </h4><p>{manufacturer}</p></Box>
        <Box mt={2}><h4>Registration Year: </h4><p>{registrationyear}</p></Box>
        <Box mt={2}><h4>Mileage: </h4><p>{mileage}</p></Box>
        <Box mt={2}><h4>Sitting Capacity: </h4><p>{sittingcapacity}</p></Box>
        <Box mt={2}><h4>Color: </h4><p>{color}</p></Box>

        <div className="buttons">
          <button type="button" className="buy-now" onClick={handleOpen}>Apply for Rent</button>

          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            alignItems="center"
            justifyContent="center"
          >
            {/* No <form> tag wrapping Box — MUI Modal works better with onSubmit on a plain form inside */}
            <Box
              component="form"
              onSubmit={rentRequest}
              sx={style}
            >
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Customer Information
              </Typography>

              <Box marginBottom={2}>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  required
                  fullWidth
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </Box>

              <Box marginBottom={2}>
                <TextField
                  label="Phone Number"
                  variant="outlined"
                  required
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Box>

              <Box marginBottom={2}>
                <TextField
                  label="Car Name"
                  variant="outlined"
                  fullWidth
                  value={carName}
                  InputProps={{ readOnly: true }}
                />
              </Box>

              <Box marginBottom={2}>
                <FormControl fullWidth>
                  <InputLabel required>Rent Days</InputLabel>
                  <Select
                    value={rentDays}
                    label="Rent Days"
                    onChange={handleChange}
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
                <input
                  type="submit"
                  value={submitting ? 'Submitting...' : 'Submit'}
                  disabled={submitting}
                />
              </Box>
            </Box>
          </Modal>
        </div>
      </Grid>
    </Grid>
  )
}

export const getStaticPaths = async () => {
  const freshClient = client.withConfig({ useCdn: false })
  const query = `*[_type == "carsforrent" && defined(slug.current)]{slug{ current }}`
  const cars = await freshClient.fetch(query);

  const paths = cars
    .filter((item) => item?.slug?.current)
    .map((item) => ({
      params: { slug: item.slug.current }
    }))

  return { paths, fallback: 'blocking' }
}

export const getStaticProps = async ({ params: { slug } }) => {
  const freshClient = client.withConfig({ useCdn: false })
  const query = `*[_type == "carsforrent" && slug.current == $slug][0]`
  let car = await freshClient.fetch(query, { slug })

  if (!car) {
    await new Promise(res => setTimeout(res, 2000))
    car = await freshClient.fetch(query, { slug })
  }

  if (!car) {
    return { notFound: true, revalidate: 10 }
  }

  return { props: { car }, revalidate: 60 }
}

export default CarDetails