const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // console.log(req)
  if (req.method === 'POST') {
    
    
    try {
      
      // Create Checkout Sessions from body params.
      const params = {
        submit_type: 'pay',
        mode: 'payment',
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        shipping_options: [
            { shipping_rate: 'shr_1LdYu7Js2kkM9ZQJvJvZBG0s'},
            { shipping_rate: 'shr_1LdYvoJs2kkM9ZQJQ45YNHmp'}
        ],
        line_items: req.body.value.map((item) => {
            console.log(item)
        }),
        mode: 'payment',
        success_url: `${req.headers.origin}/?success=true`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      }
      const session = await stripe.checkout.sessions.create(params);
      res.redirect(303, session.url);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}