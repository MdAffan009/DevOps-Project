pipeline {

    agent {
        label 'docker-agent-html'
    }

    environment {
    DOCKER_HOST = 'tcp://docker-daemon:2375'
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
                branch 'test'
            }

            steps {
                sh 'npm test'
            }
        }

        stage('Debug Docker') {
            steps {
               sh 'echo $DOCKER_HOST'
               sh 'docker version'
            }
}

        stage('Test Docker') {
            steps {
                sh "docker ps"
            }
        }

        stage('Docker build') {
            steps {
                sh "docker build -t robinparker995/devops-project:${BUILD_NUMBER} ."
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