import React, { useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0'
import { useRouter } from 'next/router'
import { Grid } from '@mui/material'
import { TableBody, TableCell, TableRow, Box, FormControl, TextField, MenuItem , Select, InputLabel, TableContainer, Table, TableHead  } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useCarContextProvider } from '../context/CarContextProvider';
import { urlFor } from '../lib/client';
import  Link  from 'next/link'
import getStripe from './getStripe';

const billingandshipping = () => {

const { value } = useCarContextProvider()
const router = useRouter()
const { user } = useUser()
const [ country, setCountry ] = useState('')
const [ firstName, setFirstName ] = useState('')
const [ lastName, setLastName ] = useState('')
const [ email, setEmail ] = useState('')
const [ addressLine1, setAddressLine1 ] = useState('')
const [ addressLine2, setAddressLine2 ] = useState('')
const [ city, setCity ] = useState('')
const [ state, setState ] = useState('')


const steps = ['Enter Billing Address', 'Enter Shipping Address', 'Confirm your Order'];

const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepOptional = (step) => {
    return step === 1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

const countryList = [
	"Afghanistan",
	"Albania",
	"Algeria",
	"American Samoa",
	"Andorra",
	"Angola",
	"Anguilla",
	"Antarctica",
	"Antigua and Barbuda",
	"Argentina",
	"Armenia",
	"Aruba",
	"Australia",
	"Austria",
	"Azerbaijan",
	"Bahamas (the)",
	"Bahrain",
	"Bangladesh",
	"Barbados",
	"Belarus",
	"Belgium",
	"Belize",
	"Benin",
	"Bermuda",
	"Bhutan",
	"Bolivia (Plurinational State of)",
	"Bonaire, Sint Eustatius and Saba",
	"Bosnia and Herzegovina",
	"Botswana",
	"Bouvet Island",
	"Brazil",
	"British Indian Ocean Territory (the)",
	"Brunei Darussalam",
	"Bulgaria",
	"Burkina Faso",
	"Burundi",
	"Cabo Verde",
	"Cambodia",
	"Cameroon",
	"Canada",
	"Cayman Islands (the)",
	"Central African Republic (the)",
	"Chad",
	"Chile",
	"China",
	"Christmas Island",
	"Cocos (Keeling) Islands (the)",
	"Colombia",
	"Comoros (the)",
	"Congo (the Democratic Republic of the)",
	"Congo (the)",
	"Cook Islands (the)",
	"Costa Rica",
	"Croatia",
	"Cuba",
	"Curaçao",
	"Cyprus",
	"Czechia",
	"Côte d'Ivoire",
	"Denmark",
	"Djibouti",
	"Dominica",
	"Dominican Republic (the)",
	"Ecuador",
	"Egypt",
	"El Salvador",
	"Equatorial Guinea",
	"Eritrea",
	"Estonia",
	"Eswatini",
	"Ethiopia",
	"Falkland Islands (the) [Malvinas]",
	"Faroe Islands (the)",
	"Fiji",
	"Finland",
	"France",
	"French Guiana",
	"French Polynesia",
	"French Southern Territories (the)",
	"Gabon",
	"Gambia (the)",
	"Georgia",
	"Germany",
	"Ghana",
	"Gibraltar",
	"Greece",
	"Greenland",
	"Grenada",
	"Guadeloupe",
	"Guam",
	"Guatemala",
	"Guernsey",
	"Guinea",
	"Guinea-Bissau",
	"Guyana",
	"Haiti",
	"Heard Island and McDonald Islands",
	"Holy See (the)",
	"Honduras",
	"Hong Kong",
	"Hungary",
	"Iceland",
	"India",
	"Indonesia",
	"Iran (Islamic Republic of)",
	"Iraq",
	"Ireland",
	"Isle of Man",
	"Israel",
	"Italy",
	"Jamaica",
	"Japan",
	"Jersey",
	"Jordan",
	"Kazakhstan",
	"Kenya",
	"Kiribati",
	"Korea (the Democratic People's Republic of)",
	"Korea (the Republic of)",
	"Kuwait",
	"Kyrgyzstan",
	"Lao People's Democratic Republic (the)",
	"Latvia",
	"Lebanon",
	"Lesotho",
	"Liberia",
	"Libya",
	"Liechtenstein",
	"Lithuania",
	"Luxembourg",
	"Macao",
	"Madagascar",
	"Malawi",
	"Malaysia",
	"Maldives",
	"Mali",
	"Malta",
	"Marshall Islands (the)",
	"Martinique",
	"Mauritania",
	"Mauritius",
	"Mayotte",
	"Mexico",
	"Micronesia (Federated States of)",
	"Moldova (the Republic of)",
	"Monaco",
	"Mongolia",
	"Montenegro",
	"Montserrat",
	"Morocco",
	"Mozambique",
	"Myanmar",
	"Namibia",
	"Nauru",
	"Nepal",
	"Netherlands (the)",
	"New Caledonia",
	"New Zealand",
	"Nicaragua",
	"Niger (the)",
	"Nigeria",
	"Niue",
	"Norfolk Island",
	"Northern Mariana Islands (the)",
	"Norway",
	"Oman",
	"Pakistan",
	"Palau",
	"Palestine, State of",
	"Panama",
	"Papua New Guinea",
	"Paraguay",
	"Peru",
	"Philippines (the)",
	"Pitcairn",
	"Poland",
	"Portugal",
	"Puerto Rico",
	"Qatar",
	"Republic of North Macedonia",
	"Romania",
	"Russian Federation (the)",
	"Rwanda",
	"Réunion",
	"Saint Barthélemy",
	"Saint Helena, Ascension and Tristan da Cunha",
	"Saint Kitts and Nevis",
	"Saint Lucia",
	"Saint Martin (French part)",
	"Saint Pierre and Miquelon",
	"Saint Vincent and the Grenadines",
	"Samoa",
	"San Marino",
	"Sao Tome and Principe",
	"Saudi Arabia",
	"Senegal",
	"Serbia",
	"Seychelles",
	"Sierra Leone",
	"Singapore",
	"Sint Maarten (Dutch part)",
	"Slovakia",
	"Slovenia",
	"Solomon Islands",
	"Somalia",
	"South Africa",
	"South Georgia and the South Sandwich Islands",
	"South Sudan",
	"Spain",
	"Sri Lanka",
	"Sudan (the)",
	"Suriname",
	"Svalbard and Jan Mayen",
	"Sweden",
	"Switzerland",
	"Syrian Arab Republic",
	"Taiwan",
	"Tajikistan",
	"Tanzania, United Republic of",
	"Thailand",
	"Timor-Leste",
	"Togo",
	"Tokelau",
	"Tonga",
	"Trinidad and Tobago",
	"Tunisia",
	"Turkey",
	"Turkmenistan",
	"Turks and Caicos Islands (the)",
	"Tuvalu",
	"Uganda",
	"Ukraine",
	"United Arab Emirates (the)",
	"United Kingdom of Great Britain and Northern Ireland (the)",
	"United States Minor Outlying Islands (the)",
	"United States of America (the)",
	"Uruguay",
	"Uzbekistan",
	"Vanuatu",
	"Venezuela (Bolivarian Republic of)",
	"Viet Nam",
	"Virgin Islands (British)",
	"Virgin Islands (U.S.)",
	"Wallis and Futuna",
	"Western Sahara",
	"Yemen",
	"Zambia",
	"Zimbabwe",
	"Åland Islands"
];

useEffect(() => {
    // if(!user)
    // {
    //     router.push('/api/auth/login')
    // }
},[])

const handleCheckout = async () => {
	
	const stripe = await getStripe()
	
	const response = await fetch('api/stripe', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',

		},
		body: JSON.stringify({name: 'carlast'})
	})

	if(response.statusCode === 500)
	return

	const data = await response.json()
	
	stripe.redirectToCheckout({
		sessionId: data.id
	})
}
  return (

    // new code //

    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
            { activeStep == 0 ? (

<Grid
container
spacing={0}
direction="column"
alignItems="center"
justifyContent="center"
style={{ minHeight: '70vh' }}
>
   
		<FormControl minWidth={100} >
		<Grid container>
			<Grid item xs={6}  marginBottom={2}>
				<TextField value={firstName} id="outlined-basic" label="First Name" variant="outlined" onChange={(e) => setFirstName(e.target.value)}/>
			</Grid>
			<Grid item xs={6}  marginBottom={2}>
				<TextField value={lastName} id="outlined-basic" label="Last Name" variant="outlined" onChange={(e) => setLastName(e.target.value) }/>
			</Grid>
		</Grid>
		<Grid container>
			<Grid item xs={12} marginRight={2} marginBottom={2}>
			<TextField value={email} id="outlined-basic" label="Email Address" variant="outlined" onChange={(e) => setEmail(e.target.value) }/>
			</Grid>
			
		</Grid>
		
		<Box mb={2}>
		<TextField value={addressLine1} id="outlined-basic" label="Address Line 1" variant="outlined" onChange={(e) => setAddressLine1(e.target.value) }/>
		</Box>
		<Box mb={2}>
		<TextField value={addressLine2} id="outlined-basic" label="Address Line 2" variant="outlined" onChange={(e) => setAddressLine2(e.target.value) }/>
		</Box>
		<Grid container>
			<Grid item xs={3} marginRight={2} marginBottom={2}>
				<TextField value={city} id="outlined-basic" label="City" variant="outlined" onChange={(e) => setCity(e.target.value) }/>
			</Grid>
			<Grid item xs={3} marginRight={2} marginBottom={2}>
			<TextField value={state} id="outlined-basic" label="State" variant="outlined" onChange={(e) => setState(e.target.value) }/>
			</Grid>
			<Grid item sx={{ minWidth: 140 }}  marginRight={2} marginBottom={2}>
								<FormControl fullWidth>
									<InputLabel id="demo-simple-select-label">Country</InputLabel>
									<Select
									labelId="demo-simple-select-label"
									id="demo-simple-select"
									value={country}
									label="Country"
									onChange={(e) => setCountry(e.target.value)}
									>
									{ countryList.map((country) => <MenuItem value={country}>{country}</MenuItem>)}
									</Select>
								</FormControl>
								
							</Grid>
		</Grid>
		
	</FormControl>

</Grid>
                
            ) : activeStep == 1 ? (
				<Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                style={{ minHeight: '70vh' }}
                >
                   
                        <FormControl minWidth={100} >
                        <Grid container>
							<Grid item xs={6}  marginBottom={2}>
								<TextField value={firstName} id="outlined-basic" label="First Name" variant="outlined" onChange={(e) => setFirstName(e.target.value)}/>
							</Grid>
							<Grid item xs={6}  marginBottom={2}>
								<TextField value={lastName} id="outlined-basic" label="Last Name" variant="outlined" onChange={(e) => setLastName(e.target.value) }/>
							</Grid>
						</Grid>
						<Grid container>
							<Grid item xs={12} marginRight={2} marginBottom={2}>
							<TextField value={email} id="outlined-basic" label="Email Address" variant="outlined" onChange={(e) => setEmail(e.target.value) }/>
							</Grid>
							
						</Grid>
                        
                        <Box mb={2}>
                        <TextField value={addressLine1} id="outlined-basic" label="Address Line 1" variant="outlined" onChange={(e) => setAddressLine1(e.target.value) }/>
                        </Box>
                        <Box mb={2}>
                        <TextField value={addressLine2} id="outlined-basic" label="Address Line 2" variant="outlined" onChange={(e) => setAddressLine2(e.target.value) }/>
                        </Box>
						<Grid container>
							<Grid item xs={3} marginRight={2} marginBottom={2}>
								<TextField value={city} id="outlined-basic" label="City" variant="outlined" onChange={(e) => setCity(e.target.value) }/>
							</Grid>
							<Grid item xs={3} marginRight={2} marginBottom={2}>
							<TextField value={state} id="outlined-basic" label="State" variant="outlined" onChange={(e) => setState(e.target.value) }/>
							</Grid>
							<Grid item sx={{ minWidth: 140 }}  marginRight={2} marginBottom={2}>
								<FormControl fullWidth>
									<InputLabel id="demo-simple-select-label">Country</InputLabel>
									<Select
									labelId="demo-simple-select-label"
									id="demo-simple-select"
									value={country}
									label="Country"
									onChange={(e) => setCountry(e.target.value)}
									>
									{ countryList.map((country) => <MenuItem value={country}>{country}</MenuItem>)}
									</Select>
								</FormControl>
								
							</Grid>
						</Grid>
                        
                    </FormControl>
        
                </Grid>
			) : (
				
					<Grid
					container
					spacing={0}
					direction="row"
					alignItems="center"
					justifyContent="center"
					style={{ minHeight: '70vh' }}
					>
						<Grid item xs={12} lg={6}>
							<Typography variant="h3" component="h2">
								Billing Details
							</Typography>
						<Box
							component="form"
							sx={{
								'& .MuiTextField-root': { m: 1, width: '25ch' },
							}}
							noValidate
							autoComplete="off"
							>
							<div>
								
								<TextField
								disabled
								id="outlined-disabled"
								label="First Name"
								defaultValue={firstName}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="Last Name"
								defaultValue={lastName}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="Email"
								defaultValue={email}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="Address Line 1"
								defaultValue={addressLine1}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="Address Line 2"
								defaultValue={addressLine2}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="City"
								defaultValue={city}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="State"
								defaultValue={state}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="Country"
								defaultValue={country}
								/>
						
							</div>
							</Box>
							<Typography variant="h3" component="h2">
								Shipping Details
							</Typography>
							<Box
							component="form"
							sx={{
								'& .MuiTextField-root': { m: 1, width: '25ch' },
							}}
							noValidate
							autoComplete="off"
							>
							<div>
								
								<TextField
								disabled
								id="outlined-disabled"
								label="First Name"
								defaultValue={firstName}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="Last Name"
								defaultValue={lastName}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="Email"
								defaultValue={email}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="Address Line 1"
								defaultValue={addressLine1}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="Address Line 2"
								defaultValue={addressLine2}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="City"
								defaultValue={city}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="State"
								defaultValue={state}
								/>
								<TextField
								disabled
								id="outlined-disabled"
								label="Country"
								defaultValue={country}
								/>
						
							</div>
							</Box>
						</Grid>
						<Grid item xs={12} lg={6}>
							{/* Adding New Code */}

							<TableContainer component={Paper}>
							<Table sx={{ minWidth: 700 }} aria-label="spanning table">
								
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
									<TableCell align="right">{row.price}</TableCell>
									</TableRow>
								))}

								<TableRow>
									<TableCell rowSpan={3} />
									<TableCell colSpan={2}>Subtotal</TableCell>
									<TableCell align="right">200</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>Tax</TableCell>
									<TableCell align="right">200</TableCell>
									<TableCell align="right">200</TableCell>
								</TableRow>
								<TableRow>
									<TableCell colSpan={2}>Total</TableCell>
									<TableCell align="right">200</TableCell>
								</TableRow>
								</TableBody>
								
							</Table>
							</TableContainer>
						
							<div className="buttons" align="right">
								<button type="button" className="buy-now" onClick={handleCheckout}>Checkout</button>
							</div>
							
							{/* Code Ends  */}
						</Grid>

				</Grid>
				
			)}
			 {/* <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>} */}
          
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}

            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Checkout' : 'Next'}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>

    // new code ends
  )
}

export default billingandshipping
