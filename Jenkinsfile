pipeline {
    agent any

    environment {
        // ── Sanity credentials (add all of these in Jenkins → Credentials) ──
        SANITY_PROJECT_ID             = credentials('sanity-project-id')
        SANITY_DATASET                = 'production'
        SANITY_API_TOKEN              = credentials('sanity-api-token')
        SANITY_EMAIL                  = credentials('sanity-email')
        SANITY_PASSWORD               = credentials('sanity-password')
        SANITY_URL                    = credentials('sanity-url')

        // ── Vercel credentials ──
        VERCEL_TOKEN                  = credentials('vercel-token')
        VERCEL_PROJECT_ID             = credentials('vercel-project-id')

        // ── NEXT_PUBLIC_ variants so sanity-api.js and sanityTestClient.js
        //    find their env vars on Jenkins exactly as they do locally ──
        NEXT_PUBLIC_SANITY_PROJECT_ID = credentials('sanity-project-id')
        NEXT_PUBLIC_SANITY_DATASET    = 'production'
        NEXT_PUBLIC_SANITY_TOKEN      = credentials('sanity-api-token')

        // ── Replace with your actual Vercel deployment URL ──
        NEXT_PUBLIC_BASE_URL          = 'https://carlast.vercel.app/'

        CI                            = 'true'
        PLAYWRIGHT_BROWSERS_PATH      = '0'
    }


    options {
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    tools {
        nodejs 'NodeJS 18'
    }

    stages {

        stage('Debug Credentials') {
            steps {
                bat 'echo Project ID starts with: %SANITY_PROJECT_ID:~0,4%'
                bat 'echo Token starts with: %SANITY_API_TOKEN:~0,4%'
                bat 'echo Dataset is: %SANITY_DATASET%'
            }
        }


        // ──────────────────────────────────────────────────────────────
        // STAGE 1: Checkout & Install Dependencies
        // ──────────────────────────────────────────────────────────────
        stage('Checkout & Install Dependencies') {
            steps {
                checkout scm

                bat 'node --version'
                bat 'npm --version'

                // Install NextJS app dependencies
                bat 'npm ci'

                // Install Sanity Studio dependencies
                dir('sanity_carlast') {
                    bat 'npm ci'
                }

                // Install Chromium only — sufficient for CI, keeps the pipeline fast
                bat '''
                    set PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000
                    npx playwright install chromium --with-deps
                '''


                // Write .env for sanity_carlast at runtime from Jenkins credentials.
                // This means you never commit your .env file to git.
                bat '''
                    echo SANITY_URL=%SANITY_URL%> sanity_carlast\\.env
                    echo NEXT_PUBLIC_SANITY_DATASET=%SANITY_DATASET%>> sanity_carlast\\.env
                    echo NEXT_PUBLIC_SANITY_PROJECT_ID=%SANITY_PROJECT_ID%>> sanity_carlast\\.env
                    echo NEXT_PUBLIC_SANITY_TOKEN=%SANITY_API_TOKEN%>> sanity_carlast\\.env
                    echo SANITY_EMAIL=%SANITY_EMAIL%>> sanity_carlast\\.env
                    echo SANITY_PASSWORD=%SANITY_PASSWORD%>> sanity_carlast\\.env
                '''
            }
        }

        

        // ──────────────────────────────────────────────────────────────
        // STAGE 2: Sanity Pre-flight Check
        // Verifies the API token and project are reachable before
        // spending time running auth setup and tests.
        // ──────────────────────────────────────────────────────────────
        stage('Sanity Pre-flight Check') {
            steps {
                bat 'curl -gf -H "Authorization: Bearer %SANITY_API_TOKEN%" "https://%SANITY_PROJECT_ID%.api.sanity.io/v2021-10-21/data/query/%SANITY_DATASET%?query=*[0]" || (echo Sanity API unreachable - check credentials && exit 1)'
            }
        }

        // ──────────────────────────────────────────────────────────────
        // STAGE 3: Sanity Auth Setup
        // Runs global-setup.js to produce .auth/user.json.
        // Skips re-authentication if the session file is less than 12hrs old.
        // Must complete before backend Playwright tests run.
        // ──────────────────────────────────────────────────────────────
        stage('Sanity Auth Setup') {
            steps {
                bat 'node global-setup.js'
            }
        }

        // ──────────────────────────────────────────────────────────────
        // STAGE 4: Wait for Vercel Deployment
        // Vercel auto-deploys on git push via its own GitHub integration.
        // This stage polls the Vercel API until that deployment is READY
        // so frontend tests never run against a stale build.
        // ──────────────────────────────────────────────────────────────
        stage('Wait for Vercel Deployment') {
            steps {
                bat '''
                    echo const https = require('https'); > wait-vercel-temp.js
                    echo const VERCEL_TOKEN = process.env.VERCEL_TOKEN; >> wait-vercel-temp.js
                    echo const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID; >> wait-vercel-temp.js
                    echo const POLL_INTERVAL = 10000; >> wait-vercel-temp.js
                    echo const MAX_WAIT = 300000; >> wait-vercel-temp.js
                    echo const start = Date.now(); >> wait-vercel-temp.js
                    echo function check() { >> wait-vercel-temp.js
                    echo   const options = { >> wait-vercel-temp.js
                    echo     hostname: 'api.vercel.com', >> wait-vercel-temp.js
                    echo     path: '/v6/deployments?projectId=' + VERCEL_PROJECT_ID + '&limit=1', >> wait-vercel-temp.js
                    echo     headers: { Authorization: 'Bearer ' + VERCEL_TOKEN } >> wait-vercel-temp.js
                    echo   }; >> wait-vercel-temp.js
                    echo   https.get(options, function(res) { >> wait-vercel-temp.js
                    echo     var data = ''; >> wait-vercel-temp.js
                    echo     res.on('data', function(c) { data += c; }); >> wait-vercel-temp.js
                    echo     res.on('end', function() { >> wait-vercel-temp.js
                    echo       try { >> wait-vercel-temp.js
                    echo         var dep = JSON.parse(data).deployments[0]; >> wait-vercel-temp.js
                    echo         var elapsed = Math.round((Date.now() - start) / 1000); >> wait-vercel-temp.js
                    echo         console.log('[' + elapsed + 's] Vercel status: ' + dep.state); >> wait-vercel-temp.js
                    echo         if (dep.state === 'READY') { console.log('Vercel deployment is live'); process.exit(0); } >> wait-vercel-temp.js
                    echo         if (dep.state === 'ERROR') { console.error('Vercel deployment failed'); process.exit(1); } >> wait-vercel-temp.js
                    echo         if (Date.now() - start >= MAX_WAIT) { console.error('Timeout'); process.exit(1); } >> wait-vercel-temp.js
                    echo         setTimeout(check, POLL_INTERVAL); >> wait-vercel-temp.js
                    echo       } catch(e) { console.error('Parse error: ' + e.message); process.exit(1); } >> wait-vercel-temp.js
                    echo     }); >> wait-vercel-temp.js
                    echo   }).on('error', function(e) { console.error('Request error: ' + e.message); process.exit(1); }); >> wait-vercel-temp.js
                    echo } >> wait-vercel-temp.js
                    echo check(); >> wait-vercel-temp.js
                    node wait-vercel-temp.js
                    del wait-vercel-temp.js
                '''
            }
        }
        // ──────────────────────────────────────────────────────────────
        // STAGE 5: Parallel — Frontend Tests & CSV Upload
        // These two run in parallel because they have no dependency on
        // each other. Frontend tests hit the already-deployed Vercel app.
        // Backend tests log into Sanity Studio and upload vehicles.csv.
        // ──────────────────────────────────────────────────────────────
        stage('5a — Frontend Playwright Tests') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat 'npx playwright test --project=frontend-chromium --reporter=html,list'
                }
            }
            post {
                always {
                    bat 'if not exist reports\\frontend mkdir reports\\frontend'
                    bat 'xcopy /E /Y playwright-report\\index.html reports\\frontend\\'
                    bat 'if exist playwright-report\\data xcopy /E /Y playwright-report\\data reports\\frontend\\data\\'
                    stash name: 'frontend-report', includes: 'reports/frontend/**'
                }
            }
        }

        stage('5b — CSV Upload via Sanity Studio') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    bat 'npx playwright test --project=backend-chromium --reporter=html,list'
                }
            }
            post {
                always {
                    bat 'if not exist reports\\backend mkdir reports\\backend'
                    bat 'xcopy /E /Y playwright-report\\index.html reports\\backend\\'
                    bat 'if exist playwright-report\\data xcopy /E /Y playwright-report\\data reports\\backend\\data\\'
                    stash name: 'backend-report', includes: 'reports/backend/**'
                }
            }
        }

        // ──────────────────────────────────────────────────────────────
        // STAGE 6: GROQ Validation
        // Queries api.sanity.io directly (NOT the CDN) to confirm all
        // 10 uploaded documents exist and have no empty required fields.
        // The sanity-use-cdn: false header bypasses edge caching so
        // freshly uploaded documents are always visible immediately.
        // ──────────────────────────────────────────────────────────────
        // ──────────────────────────────────────────────────────────────
        // STAGE 6: GROQ Document Validation
        // ──────────────────────────────────────────────────────────────
        stage('GROQ Document Validation') {
            steps {
                bat '''
                    echo const https = require('https'); > groq-validate-temp.js
                    echo const PROJECT_ID = process.env.SANITY_PROJECT_ID; >> groq-validate-temp.js
                    echo const DATASET = process.env.SANITY_DATASET ^|^| 'production'; >> groq-validate-temp.js
                    echo const TOKEN = process.env.SANITY_API_TOKEN; >> groq-validate-temp.js
                    echo const TEST_CARS = ['Toyota Corolla GLi','Honda Civic Oriel','Suzuki Alto VXR','Hyundai Tucson AWD','Toyota Fortuner Sigma','Kia Sportage Alpha','Honda BR-V S Plus','Suzuki Cultus VXL','Toyota Yaris ATIV','MG HS Essence']; >> groq-validate-temp.js
                    echo const REQUIRED = ['name','modelyear','manufacturer','registrationyear','mileage','sittingcapacity','color','transmission','price','description']; >> groq-validate-temp.js
                    echo const nameList = TEST_CARS.map(function(n) { return '"' + n + '"'; }).join(','); >> groq-validate-temp.js
                    echo const query = encodeURIComponent('*[_type == "carsforsale" ^&^& name in [' + nameList + ']] { name, modelyear, manufacturer, registrationyear, mileage, sittingcapacity, color, transmission, price, description, "hasImage": defined(images[0].asset._ref) }'); >> groq-validate-temp.js
                    echo const url = 'https://' + PROJECT_ID + '.api.sanity.io/v2021-10-21/data/query/' + DATASET + '?query=' + query; >> groq-validate-temp.js
                    echo https.get(url, { headers: { 'Authorization': 'Bearer ' + TOKEN, 'sanity-use-cdn': 'false' } }, function(res) { >> groq-validate-temp.js
                    echo   var data = ''; >> groq-validate-temp.js
                    echo   res.on('data', function(c) { data += c; }); >> groq-validate-temp.js
                    echo   res.on('end', function() { >> groq-validate-temp.js
                    echo     var parsed = JSON.parse(data); >> groq-validate-temp.js
                    echo     var result = parsed.result; >> groq-validate-temp.js
                    echo     if (!result ^|^| result.length === 0) { console.error('No test documents found in Sanity'); process.exit(1); } >> groq-validate-temp.js
                    echo     var foundNames = result.map(function(d) { return d.name; }); >> groq-validate-temp.js
                    echo     var missingDocs = TEST_CARS.filter(function(n) { return foundNames.indexOf(n) === -1; }); >> groq-validate-temp.js
                    echo     if (missingDocs.length ^> 0) { console.error('Missing cars: ' + missingDocs.join(', ')); process.exit(1); } >> groq-validate-temp.js
                    echo     var passed = true; >> groq-validate-temp.js
                    echo     result.forEach(function(doc, i) { >> groq-validate-temp.js
                    echo       console.log('Document ' + (i+1) + ': ' + doc.name); >> groq-validate-temp.js
                    echo       REQUIRED.forEach(function(f) { >> groq-validate-temp.js
                    echo         if (doc[f] !== undefined ^&^& doc[f] !== null ^&^& doc[f] !== '') { console.log('  OK: ' + f); } >> groq-validate-temp.js
                    echo         else { console.error('  MISSING: ' + f); passed = false; } >> groq-validate-temp.js
                    echo       }); >> groq-validate-temp.js
                    echo       if (!doc.hasImage) { console.error('  MISSING: image'); passed = false; } >> groq-validate-temp.js
                    echo       else { console.log('  OK: image'); } >> groq-validate-temp.js
                    echo     }); >> groq-validate-temp.js
                    echo     if (!passed) { console.error('GROQ validation failed'); process.exit(1); } >> groq-validate-temp.js
                    echo     console.log('All ' + result.length + ' documents passed validation'); >> groq-validate-temp.js
                    echo   }); >> groq-validate-temp.js
                    echo }).on('error', function(e) { console.error(e.message); process.exit(1); }); >> groq-validate-temp.js
                    node groq-validate-temp.js
                    del groq-validate-temp.js
                '''
            }
        }

        // ──────────────────────────────────────────────────────────────
        // STAGE 7: Frontend Revalidation Verification
        // ──────────────────────────────────────────────────────────────
        stage('Frontend Revalidation Verification') {
            steps {
                bat '''
                    echo const https = require('https'); > poll-frontend-temp.js
                    echo const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ^|^| 'https://carlast.vercel.app'; >> poll-frontend-temp.js
                    echo const EXPECTED = ['Toyota Corolla GLi','Honda Civic Oriel','Suzuki Alto VXR','Hyundai Tucson AWD','Toyota Fortuner Sigma','Kia Sportage Alpha','Honda BR-V S Plus','Suzuki Cultus VXL','Toyota Yaris ATIV','MG HS Essence']; >> poll-frontend-temp.js
                    echo const MAX_WAIT = 120000; >> poll-frontend-temp.js
                    echo const INTERVAL = 5000; >> poll-frontend-temp.js
                    echo const start = Date.now(); >> poll-frontend-temp.js
                    echo function fetchPage(cb) { >> poll-frontend-temp.js
                    echo   https.get(BASE_URL, function(res) { >> poll-frontend-temp.js
                    echo     var body = ''; >> poll-frontend-temp.js
                    echo     res.on('data', function(c) { body += c; }); >> poll-frontend-temp.js
                    echo     res.on('end', function() { cb(null, body); }); >> poll-frontend-temp.js
                    echo   }).on('error', cb); >> poll-frontend-temp.js
                    echo } >> poll-frontend-temp.js
                    echo function poll() { >> poll-frontend-temp.js
                    echo   fetchPage(function(err, html) { >> poll-frontend-temp.js
                    echo     var elapsed = Math.round((Date.now() - start) / 1000); >> poll-frontend-temp.js
                    echo     if (err) { console.log('[' + elapsed + 's] Fetch error: ' + err.message); } >> poll-frontend-temp.js
                    echo     else { >> poll-frontend-temp.js
                    echo       var missing = EXPECTED.filter(function(n) { return html.indexOf(n) === -1; }); >> poll-frontend-temp.js
                    echo       console.log('[' + elapsed + 's] Missing: ' + missing.length + '/' + EXPECTED.length); >> poll-frontend-temp.js
                    echo       if (missing.length === 0) { console.log('All vehicles visible on frontend'); process.exit(0); } >> poll-frontend-temp.js
                    echo     } >> poll-frontend-temp.js
                    echo     if (Date.now() - start ^>= MAX_WAIT) { console.error('Timeout - vehicles did not appear within 90s'); process.exit(1); } >> poll-frontend-temp.js
                    echo     setTimeout(poll, INTERVAL); >> poll-frontend-temp.js
                    echo   }); >> poll-frontend-temp.js
                    echo } >> poll-frontend-temp.js
                    echo poll(); >> poll-frontend-temp.js
                    node poll-frontend-temp.js
                    del poll-frontend-temp.js
                '''
            }
        }
        // ──────────────────────────────────────────────────────────────
        // STAGE 8: HTML Report Generation
        // Unstashes both Playwright HTML reports from Stage 5 and
        // publishes them as separate named reports in Jenkins.
        // NOTE: For reports to render correctly (not distorted) you must
        // relax Jenkins CSP once via Manage Jenkins > Script Console:
        //   System.setProperty("hudson.model.DirectoryBrowserSupport.CSP","")
        // ──────────────────────────────────────────────────────────────
        stage('Generate HTML Reports') {
            steps {
                unstash 'frontend-report'
                unstash 'backend-report'

                publishHTML(target: [
                    allowMissing         : true,
                    alwaysLinkToLastBuild: true,
                    keepAll              : true,
                    reportDir            : 'reports/frontend',
                    reportFiles          : 'index.html',
                    reportName           : 'Frontend Playwright Report',
                    includes             : '**/*'
                ])

                publishHTML(target: [
                    allowMissing         : true,
                    alwaysLinkToLastBuild: true,
                    keepAll              : true,
                    reportDir            : 'reports/backend',
                    reportFiles          : 'index.html',
                    reportName           : 'Backend Playwright Report',
                    includes             : '**/*'
                ])
            }
        }

        // ──────────────────────────────────────────────────────────────
        // STAGE 9: Teardown — Delete Test Documents from Sanity
        // Deletes only the 10 specific vehicles uploaded by this pipeline
        // run, matched by name. Never touches any other Sanity documents.
        // Inline curl — no external script file needed.
        // ──────────────────────────────────────────────────────────────
        stage('Teardown: Delete Test Documents') {
            steps {
                bat 'curl -sf -X POST -H "Authorization: Bearer %SANITY_API_TOKEN%" -H "Content-Type: application/json" -d "{\\"mutations\\":[{\\"delete\\":{\\"query\\":\\"*[_type == \'carsforsale\' && name in [\'Toyota Corolla GLi\',\'Honda Civic Oriel\',\'Suzuki Alto VXR\',\'Hyundai Tucson AWD\',\'Toyota Fortuner Sigma\',\'Kia Sportage Alpha\',\'Honda BR-V S Plus\',\'Suzuki Cultus VXL\',\'Toyota Yaris ATIV\',\'MG HS Essence\']]\\"}}"  "https://%SANITY_PROJECT_ID%.api.sanity.io/v2021-10-21/data/mutate/%SANITY_DATASET%" && echo Test documents deleted successfully || echo Cleanup failed'
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // POST: Runs after all stages regardless of outcome
    // ──────────────────────────────────────────────────────────────────
    post {

        failure {
            echo 'Pipeline failed — running inline cleanup to avoid polluting Sanity'
            bat '''
                curl -sf -X POST ^
                  -H "Authorization: Bearer %SANITY_API_TOKEN%" ^
                  -H "Content-Type: application/json" ^
                  -d "{\\"mutations\\":[{\\"delete\\":{\\"query\\":\\"*[_type == 'carsforsale' && name in ['Toyota Corolla GLi','Honda Civic Oriel','Suzuki Alto VXR','Hyundai Tucson AWD','Toyota Fortuner Sigma','Kia Sportage Alpha','Honda BR-V S Plus','Suzuki Cultus VXL','Toyota Yaris ATIV','MG HS Essence']]\\"}}"  ^
                  "https://%SANITY_PROJECT_ID%.api.sanity.io/v2021-10-21/data/mutate/%SANITY_DATASET%" ^
                || exit 0
            '''
        }

        always {
            // Wipes the workspace including .auth/user.json so that stale
            // session files from this build never affect the next run
            cleanWs()
        }

        success {
            echo 'Pipeline completed successfully'
        }
    }
}