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
                bat 'npx playwright install chromium --with-deps'

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
                bat 'curl -sf -H "Authorization: Bearer %SANITY_API_TOKEN%" "https://bushe0bq.api.sanity.io/v2021-10-21/data/query/%SANITY_DATASET%?query=*[0]" || (echo Sanity API unreachable - check credentials && exit 1)'
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
                bat 'node scripts/wait-for-vercel.js'
            }
        }

        // ──────────────────────────────────────────────────────────────
        // STAGE 5: Parallel — Frontend Tests & CSV Upload
        // These two run in parallel because they have no dependency on
        // each other. Frontend tests hit the already-deployed Vercel app.
        // Backend tests log into Sanity Studio and upload vehicles.csv.
        // ──────────────────────────────────────────────────────────────
        stage('Parallel: Frontend Tests & CSV Upload') {
            parallel {

                stage('5a — Frontend Playwright Tests') {
                    steps {
                        // Runs frontend-chromium project from playwright.config.js
                        // covers homepage.spec.js and detailpage.spec.js
                        bat 'npx playwright test --project=frontend-chromium --reporter=html,list'
                    }
                    post {
                        always {
                            stash name: 'frontend-report',
                                  includes: 'playwright-report/**'
                        }
                    }
                }

                stage('5b — CSV Upload via Sanity Studio') {
                    steps {
                        // Runs dashboard.spec.js via the backend-chromium project.
                        // Uses .auth/user.json produced in Stage 3.
                        // Uploads all 10 vehicles from tests/data/vehicles.csv.
                        bat 'npx playwright test --project=backend-chromium --reporter=html,list'
                    }
                    post {
                        always {
                            stash name: 'backend-report',
                                  includes: 'playwright-report/**'
                        }
                    }
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
        stage('GROQ Document Validation') {
            steps {
                bat '''
                    node -e "
                    const https = require('https');
                    const PROJECT_ID = process.env.SANITY_PROJECT_ID;
                    const DATASET    = process.env.SANITY_DATASET || 'production';
                    const TOKEN      = process.env.SANITY_API_TOKEN;

                    const TEST_CARS  = [
                        'Toyota Corolla GLi',
                        'Honda Civic Oriel',
                        'Suzuki Alto VXR',
                        'Hyundai Tucson AWD',
                        'Toyota Fortuner Sigma',
                        'Kia Sportage Alpha',
                        'Honda BR-V S Plus',
                        'Suzuki Cultus VXL',
                        'Toyota Yaris ATIV',
                        'MG HS Essence'
                    ];

                    const nameList = TEST_CARS.map(n => '\"' + n + '\"').join(',');
                    const query    = encodeURIComponent(
                        '*[_type == \"carsforsale\" && name in [' + nameList + ']] { name, modelyear, manufacturer, registrationyear, mileage, sittingcapacity, color, transmission, price, description, \"hasImage\": defined(images[0].asset._ref) }'
                    );
                    const url = 'https://' + PROJECT_ID + '.api.sanity.io/v2021-10-21/data/query/' + DATASET + '?query=' + query;
                    const REQUIRED = ['name','modelyear','manufacturer','registrationyear','mileage','sittingcapacity','color','transmission','price','description'];

                    https.get(url, { headers: { 'Authorization': 'Bearer ' + TOKEN, 'sanity-use-cdn': 'false' } }, (res) => {
                        let data = '';
                        res.on('data', c => data += c);
                        res.on('end', () => {
                            const { result } = JSON.parse(data);

                            if (!result || result.length === 0) {
                                console.error('No test documents found in Sanity');
                                process.exit(1);
                            }

                            const foundNames  = result.map(d => d.name);
                            const missingDocs = TEST_CARS.filter(n => !foundNames.includes(n));
                            if (missingDocs.length > 0) {
                                console.error('These cars were not found in Sanity: ' + missingDocs.join(', '));
                                process.exit(1);
                            }

                            let passed = true;
                            result.forEach((doc, i) => {
                                console.log('Document ' + (i+1) + ': ' + doc.name);
                                REQUIRED.forEach(f => {
                                    if (doc[f] !== undefined && doc[f] !== null && doc[f] !== '') { console.log('  OK: ' + f); }
                                    else { console.error('  MISSING: ' + f); passed = false; }
                                });
                                if (!doc.hasImage) { console.error('  MISSING: image'); passed = false; }
                                else { console.log('  OK: image'); }
                            });

                            if (!passed) { console.error('GROQ validation failed'); process.exit(1); }
                            console.log('All ' + result.length + ' documents passed validation');
                        });
                    }).on('error', (e) => { console.error(e.message); process.exit(1); });
                    "
                '''
            }
        }

        // ──────────────────────────────────────────────────────────────
        // STAGE 7: Frontend Revalidation Verification
        // Polls the Vercel frontend every 5s up to 90s to confirm all
        // 10 vehicle names appear in the page HTML after getStaticProps
        // revalidates (revalidate is set to 60s in your Next.js pages).
        // ──────────────────────────────────────────────────────────────
        stage('Frontend Revalidation Verification') {
            steps {
                bat '''
                    node -e "
                    const https = require('https');
                    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://carlast.vercel.app/';
                    const EXPECTED = ['Toyota Corolla GLi','Honda Civic Oriel','Suzuki Alto VXR','Hyundai Tucson AWD','Toyota Fortuner Sigma','Kia Sportage Alpha','Honda BR-V S Plus','Suzuki Cultus VXL','Toyota Yaris ATIV','MG HS Essence'];
                    const MAX_WAIT = 90000;
                    const INTERVAL = 5000;
                    const start = Date.now();
                    function fetchPage(cb) {
                        https.get(BASE_URL + '/cars', (res) => {
                            let body = '';
                            res.on('data', c => body += c);
                            res.on('end', () => cb(null, body));
                        }).on('error', cb);
                    }
                    function poll() {
                        fetchPage((err, html) => {
                            const elapsed = Math.round((Date.now()-start)/1000);
                            if (err) { console.log('[' + elapsed + 's] Fetch error: ' + err.message); }
                            else {
                                const missing = EXPECTED.filter(n => !html.includes(n));
                                console.log('[' + elapsed + 's] Missing: ' + missing.length + '/' + EXPECTED.length);
                                if (missing.length === 0) { console.log('All vehicles visible on frontend'); process.exit(0); }
                            }
                            if (Date.now() - start >= MAX_WAIT) { console.error('Timeout - vehicles did not appear within 90s'); process.exit(1); }
                            setTimeout(poll, INTERVAL);
                        });
                    }
                    poll();
                    "
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

                bat 'if not exist reports\\frontend mkdir reports\\frontend'
                bat 'if not exist reports\\backend  mkdir reports\\backend'
                bat 'xcopy /E /Y playwright-report\\* reports\\frontend\\ || echo No frontend report found'
                bat 'xcopy /E /Y playwright-report\\* reports\\backend\\  || echo No backend report found'

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
                bat '''
                    curl -sf -X POST ^
                      -H "Authorization: Bearer %SANITY_API_TOKEN%" ^
                      -H "Content-Type: application/json" ^
                      -d "{\\"mutations\\":[{\\"delete\\":{\\"query\\":\\"*[_type == 'carsforsale' && name in ['Toyota Corolla GLi','Honda Civic Oriel','Suzuki Alto VXR','Hyundai Tucson AWD','Toyota Fortuner Sigma','Kia Sportage Alpha','Honda BR-V S Plus','Suzuki Cultus VXL','Toyota Yaris ATIV','MG HS Essence']]\\"}}"  ^
                      "https://%SANITY_PROJECT_ID%.api.sanity.io/v2021-10-21/data/mutate/%SANITY_DATASET%" ^
                    && echo Test documents deleted successfully ^
                    || echo Cleanup failed - manual deletion may be required
                '''
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