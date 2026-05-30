pipeline {

    agent {
        label 'docker-agent-html'
    }


    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        //CI
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

   stage('Approval') {
    steps {
        input message: 'Approve merge?', ok: 'Merge'
        }
    }   

    stage('Merge') {

      when {
         branch 'test'
        }


      steps {

        withCredentials([usernamePassword(
            credentialsId: 'github-creds',
            usernameVariable: 'GIT_USER',
            passwordVariable: 'GIT_PASS'
        )]) {

            sh '''
            git config user.email "mdaffan0502@gmail.com"
            git config user.name "MdAffan009"

            git fetch origin

            git checkout -B exp
            git pull origin exp

            git merge --no-ff origin/test -m "Merge Test into Exp"

            git push origin exp
            '''
            }
        }
    }

        //CD
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
             '''
            }
         }
    }

        stage('Deploy') {
            steps{
                sh ''' 
                docker pull robinparker995/devops-project:latest

                docker stop myapp || true 
                docker rm myapp || true

                docker run -d --name myapp --env-file /home/jenkins/.env -p 3000:3000 robinparker995/devops-project:latest
                
                '''
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
            sh 'docker logout'
            cleanWs()
        }
    }
}