// run once: node tests/data/certificates/generate-fixtures.js
const fs = require('fs')
const path = require('path')

// Minimal valid 1x1 pixel JPG in base64
const DUMMY_JPG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U' +
  'HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN' +
  'DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
  'MjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAA' +
  'AAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA' +
  '/9oADAMBAAIRAxEAPwCwABmX/9k=',
  'base64'
)

// Minimal valid 1x1 pixel PNG in base64
const DUMMY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

const files = [
  { name: 'cert-john.jpg',   buf: DUMMY_JPG },
  { name: 'cert-sara.jpg',   buf: DUMMY_JPG },
  { name: 'cert-ali.png',    buf: DUMMY_PNG },
  { name: 'cert-fatima.jpg', buf: DUMMY_JPG },
  { name: 'cert-usman.png',  buf: DUMMY_PNG },
]

const dir = path.join(__dirname)
files.forEach(({ name, buf }) => {
  fs.writeFileSync(path.join(dir, name), buf)
  console.log('Created:', name)
})