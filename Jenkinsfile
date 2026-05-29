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
                sh "docker build -t robinparker995/devops-project:${BUILD_NUMBER} -t robinparker995/devops-project:latest ."
            }
        }

        stage('Push Image') {
        steps {
            withCredentials([usernamePassword(
             credentialsId: 'dockerhub-creds',
             usernameVariable: 'DOCKER_USER',
              passwordVariable: 'DOCKER_PASS'
            )]) {
            sh '''
             echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

             docker push robinparker995/devops-project:${BUILD_NUMBER}

             docker push robinparker995/devops-project:latest

             docker logout
             '''
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
}