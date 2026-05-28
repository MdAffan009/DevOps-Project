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
                branch 'test'
            }

            steps {
                sh 'npm test'
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