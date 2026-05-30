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
    
    when{
        branch 'test'
    }

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

            git fetch origin main
            git fetch orign test

            if git ls-remote --exit-code --heads origin main; then
                git checkout -B main origin/main
            else
                git checkout -b main
            fi

            git merge --no-ff origin/test

            git push https://${GIT_USER}:${GIT_PASS}@github.com/MdAffan009/DevOps-Project.git main
            '''
            }
        }
    }

        //CD
        stage('Test Docker') {
            
            when {
                branch 'main'
            }


            steps {
                sh "docker ps"
            }
        }

        stage('Docker build') {
            when {
                branch 'main'
            }

            steps {
                sh "docker build -t robinparker995/devops-project:${BUILD_NUMBER} -t robinparker995/devops-project:latest ."
            }
        }

        stage('Push Image') {

        when {
            branch 'main'
        }

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

            when {
                branch 'main'
            }
            
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