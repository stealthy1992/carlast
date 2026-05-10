// scripts/wait-vercel.js
const https = require('https')
const VERCEL_TOKEN      = process.env.VERCEL_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const POLL_INTERVAL     = 10000
const MAX_WAIT          = 300000
const start             = Date.now()

function check() {
  const options = {
    hostname: 'api.vercel.com',
    path: '/v6/deployments?projectId=' + VERCEL_PROJECT_ID + '&limit=1',
    headers: { Authorization: 'Bearer ' + VERCEL_TOKEN }
  }

  https.get(options, function(res) {
    var data = ''
    res.on('data', function(c) { data += c })
    res.on('end', function() {
      try {
        var dep     = JSON.parse(data).deployments[0]
        var elapsed = Math.round((Date.now() - start) / 1000)
        console.log('[' + elapsed + 's] Vercel status: ' + dep.state)

        if (dep.state === 'READY') {
          console.log('Vercel deployment is live')
          process.exit(0)
        }
        if (dep.state === 'ERROR') {
          console.error('Vercel deployment failed')
          process.exit(1)
        }
        if (Date.now() - start >= MAX_WAIT) {
          console.error('Timeout waiting for Vercel')
          process.exit(1)
        }
        setTimeout(check, POLL_INTERVAL)
      } catch(e) {
        console.error('Parse error: ' + e.message)
        process.exit(1)
      }
    })
  }).on('error', function(e) {
    console.error('Request error: ' + e.message)
    process.exit(1)
  })
}

check()