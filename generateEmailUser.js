// run once: node generate-ethereal.js
const nodemailer = require('nodemailer');

nodemailer.createTestAccount().then(account => {
  console.log('ETHEREAL_USER:', account.user);
  console.log('ETHEREAL_PASS:', account.pass);
});