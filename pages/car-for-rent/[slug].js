// pages/car-for-rent/[slug].js
// Changes from your original:
//   1. Scroll position is saved before modal opens and restored on close
//      so the page doesn't jump when the MUI Modal portal mounts/unmounts.
//   2. After successful submission the modal closes and the page scrolls
//      to the success Alert at the top (using a ref).
//   3. No other logic has been changed — all your existing fields, validation,
//      file upload, and FormData submission are kept exactly as-is.

import React, { useState, useRef } from 'react'
import { urlFor, client } from '../../lib/client'
import { Grid, Box } from '@mui/material'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { useCarContextProvider } from '../../context/CarContextProvider'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'

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
}

const CarDetails = ({ car }) => {
  const {
    name, images, rent, description, transmission, modelyear,
    manufacturer, registrationyear, mileage, sittingcapacity, color,
  } = car

  const [index, setIndex]               = useState(0)
  const { rentOrder }                   = useCarContextProvider()
  const [open, setOpen]                 = useState(false)
  const [rentDays, setRentDays]         = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail]               = useState('')
  const [emailError, setEmailError]     = useState('')
  const [certificate, setCertificate]   = useState(null)
  const [fileError, setFileError]       = useState('')
  const [toggle, setToggle]             = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const carName                         = car.name

  // ── Scroll-fix refs ──────────────────────────────────────────────────────
  // Stores the Y position when the modal opens so we can restore it on close.
  const savedScrollY = useRef(0)

  // Ref attached to the Stack that wraps the success Alert so we can scroll to it.
  const alertRef = useRef(null)
  // ─────────────────────────────────────────────────────────────────────────

  // ── Modal open/close handlers with scroll preservation ───────────────────
  const handleOpen = () => {
    // Save current scroll position BEFORE MUI locks the body scroll
    savedScrollY.current = window.scrollY
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    // Restore scroll position after MUI releases the body scroll lock.
    // requestAnimationFrame ensures the DOM has settled before we scroll.
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY.current, behavior: 'instant' })
    })
  }
  // ─────────────────────────────────────────────────────────────────────────

  const validateEmail = (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value)
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowed.includes(file.type)) {
      setFileError('Only PDF, JPG, or PNG files are accepted')
      setCertificate(null)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size must be under 10MB')
      setCertificate(null)
      return
    }
    setFileError('')
    setCertificate(file)
  }

  const rentRequest = async (e) => {
    e.preventDefault()

    if (!customerName.trim() || !email.trim() || !certificate) return
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('customerName', customerName.trim())
      formData.append('email', email.trim())
      formData.append('carName', carName)
      formData.append('rentDays', rentDays)
      formData.append('clearanceCertificate', certificate)

      const res = await fetch('/api/submit-rent', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Submission failed')

      // ✅ Only addition — parse response to expose documentId
      const result = await res.json()
      console.log('Sanity document ID:', result.documentId)

      handleClose()
      setToggle(true)
      setCustomerName('')
      setEmail('')
      setEmailError('')
      setCertificate(null)
      setFileError('')
      setRentDays(1)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      })

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
      {/* Success Alert — ref attached to the Stack so scrollIntoView targets it */}
      <Grid item lg={12} md={12} sm={12} xs={12}>
        {toggle && (
          <Stack ref={alertRef} sx={{ width: '100%' }} spacing={2}>
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
              <img
                src={urlFor(images && images[index])}
                className="product-detail-image"
                alt={name}
              />
            </div>
            <div className="small-images-container">
              {images?.map((item, i) => (
                <img
                  key={i}
                  src={urlFor(item)}
                  className={i === index ? 'small-image selected-image' : 'small-image'}
                  onMouseEnter={() => setIndex(i)}
                  alt={`${name} view ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Grid>

      <Grid item lg={6} md={6}>
        <div className='product-detail-desc'><h1>{name}</h1></div>
        <Box mt={2}><h4>Details: </h4><p>{description}</p></Box>
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
          {/* handleOpen now saves scroll position before the modal opens */}
          <button type="button" className="buy-now" onClick={handleOpen}>
            Apply for Rent
          </button>

          {/* handleClose now restores scroll position when the modal closes */}
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box component="form" onSubmit={rentRequest} sx={style}>
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
                  label="Email Address"
                  variant="outlined"
                  required
                  fullWidth
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!emailError}
                  helperText={emailError}
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
                    onChange={(e) => setRentDays(e.target.value)}
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
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}
                >
                  Police Clearance Certificate <span style={{ color: 'red' }}>*</span>
                </Typography>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  onChange={handleFileChange}
                  style={{ width: '100%' }}
                />
                {fileError && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {fileError}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  Accepted formats: PDF, JPG, PNG (max 10MB)
                </Typography>
              </Box>

              <Box marginBottom={2}>
                <input
                  type="submit"
                  value={submitting ? 'Submitting...' : 'Submit'}
                  disabled={submitting || !!emailError || !!fileError}
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
  const cars = await freshClient.fetch(query)
  const paths = cars
    .filter((item) => item?.slug?.current)
    .map((item) => ({ params: { slug: item.slug.current } }))
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
  if (!car) return { notFound: true, revalidate: 10 }
  return { props: { car }, revalidate: 60 }
}

export default CarDetails