pipeline {

    agent {
        label 'docker-agent-html'
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {

            when {
                 expression {
                 env.GIT_BRANCH == 'origin/test'
                }
            }

            steps {
                sh 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploy Script"
            }
        }
    }

    post {

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed'
        }

        always {
            cleanWs()
        }
    }
}