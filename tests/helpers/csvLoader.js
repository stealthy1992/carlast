const fs       = require('fs');
const path     = require('path');
const Papa     = require('papaparse');

function loadCSV(filename) {
  const filePath = path.join(__dirname, '../data', filename);
  const content  = fs.readFileSync(filePath, 'utf8');
  const result   = Papa.parse(content, {
    header:        true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  return result.data;
}

function getCars(data) {
  return data.map(row => ({
    name: row.name,
    modelyear: row.modelyear,
    manufacturer: row.manufacturer,
    registrationyear: row.registrationyear,
    mileage: row.mileage,
    sittingcapacity: row.sittingcapacity,
    color: row.color,
    transmission: row.transmission,
    price: row.price,
    description: row.description,
    image: row.image
  }));
}

function getRentCars(data) {
  return data.map(row => ({
    name: row.name,
    modelyear: row.modelyear,
    manufacturer: row.manufacturer,
    registrationyear: row.registrationyear,
    mileage: row.mileage,
    sittingcapacity: row.sittingcapacity,
    color: row.color,
    transmission: row.transmission,
    rent: row.rent,
    description: row.description,
    image: row.image
  }));
}



// function validateRow(row) {
//   if (!row.title || row.title.trim() === '') throw new Error(`Empty title in row: ${JSON.stringify(row)}`);
//   if (!row.price || isNaN(Number(row.price))) throw new Error(`Invalid price: ${row.price}`);
//   // add checks per your schema fields
// }

module.exports = { loadCSV, getCars, getRentCars };