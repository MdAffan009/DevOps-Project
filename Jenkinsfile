pipeline {
    agent {
        lable 'docker-agent-html'
    }

    triggers {
    pollSCM('H/5 * * * *')
    }


    stages {

        stage('checkout') {      
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                npm ci
            }

        stage('Test') {
            steps {
                echo "Tests Script"
            }

        stage('Deploy') {
            steps {
                echo "Deploy Script"
            }
        }
        }
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


