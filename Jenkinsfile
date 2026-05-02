pipeline {
    agent any

    environment {
        SANITY_PROJECT_ID     = credentials('sanity-project-id')
        SANITY_DATASET        = 'production'
        SANITY_API_TOKEN      = credentials('sanity-api-token')
        NEXT_PUBLIC_BASE_URL  = 'http://localhost:3000'
        NODE_VERSION          = '18'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        // ─────────────────────────────────────────────
        // STAGE 1: Checkout & Install
        // ─────────────────────────────────────────────
        stage('Checkout & Install Dependencies') {
            steps {
                checkout scm
                sh 'node --version && npm --version'
                sh 'npm ci'                          // NextJS deps
                dir('studio') { sh 'npm ci' }        // Sanity Studio deps
                sh 'npx playwright install --with-deps chromium'
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 2: Sanity Pre-flight
        // ─────────────────────────────────────────────
        stage('Sanity Pre-flight Check') {
            steps {
                sh '''
                    curl -sf \
                      -H "Authorization: Bearer ${SANITY_API_TOKEN}" \
                      "https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${SANITY_DATASET}?query=*[0]" \
                    || { echo "Sanity API unreachable — check token/project ID"; exit 1; }
                '''
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 3: Parallel — Frontend Tests + CSV Upload
        // ─────────────────────────────────────────────
        stage('Parallel: Frontend Tests & CSV Upload') {
            parallel {

                stage('3a — Frontend Playwright Tests') {
                    steps {
                        sh 'npx playwright test tests/frontend --reporter=html,line'
                    }
                    post {
                        always {
                            // stash so Stage 6 can merge reports
                            stash name: 'frontend-report',
                                  includes: 'playwright-report/**'
                        }
                    }
                }

                stage('3b — CSV Upload (Backend Studio Tests)') {
                    steps {
                        // Only 3 rows in the CSV — keeps the pipeline fast
                        sh 'npx playwright test tests/studio/csv-upload.spec.ts --reporter=html,line'
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

        // ─────────────────────────────────────────────
        // STAGE 4: GROQ Validation
        // ─────────────────────────────────────────────
        stage('GROQ Document Validation') {
            steps {
                sh 'node scripts/groq-validate.js'
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 5: Frontend Revalidation Verification
        // ─────────────────────────────────────────────
        stage('Frontend Revalidation Verification') {
            steps {
                sh 'node scripts/poll-frontend.js'
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 6: HTML Report Generation
        // ─────────────────────────────────────────────
        stage('Generate HTML Reports') {
            steps {
                unstash 'frontend-report'
                unstash 'backend-report'

                sh '''
                    mkdir -p reports/frontend reports/backend
                    cp -r playwright-report/frontend/* reports/frontend/ || true
                    cp -r playwright-report/backend/*  reports/backend/  || true
                '''

                publishHTML(target: [
                    allowMissing         : false,
                    alwaysLinkToLastBuild: true,
                    keepAll              : true,
                    reportDir            : 'reports/frontend',
                    reportFiles          : 'index.html',
                    reportName           : 'Frontend Playwright Report'
                ])

                publishHTML(target: [
                    allowMissing         : false,
                    alwaysLinkToLastBuild: true,
                    keepAll              : true,
                    reportDir            : 'reports/backend',
                    reportFiles          : 'index.html',
                    reportName           : 'Backend (Studio) Playwright Report'
                ])
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 7: Teardown — Delete Test Documents
        // ─────────────────────────────────────────────
        stage('Teardown: Delete Test Documents') {
            steps {
                sh 'node scripts/sanity-cleanup.js'
            }
        }
    }

    // ─────────────────────────────────────────────
    // POST: Notifications
    // ─────────────────────────────────────────────
    post {
        failure {
            echo 'Pipeline failed — consider Slack/email notification here'
            // If pipeline fails mid-way, still attempt cleanup
            sh 'node scripts/sanity-cleanup.js || true'
        }
        success {
            echo 'Pipeline passed successfully!'
        }
    }
}