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

             stage('K8s Debug') {
         when {
        branch 'test'
         }
 
       steps {
        sh '''
            echo "===== KUBECTL ====="
            kubectl version --client

            echo "===== CONTEXT ====="
            kubectl config current-context || true

            echo "===== CLUSTER ====="
            kubectl cluster-info || true

            echo "===== CONFIG ====="
            kubectl config view || true
        '''
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

            git fetch origin +refs/heads/main:refs/remotes/origin/main
            git fetch origin +refs/heads/test:refs/remotes/origin/test

            if git ls-remote --exit-code --heads origin main; then
                git checkout -B main origin/main
            else
                git checkout -b main
            fi

             git merge --no-ff -X theirs origin/test -m "Merge test into main"

            git push https://${GIT_USER}:${GIT_PASS}@github.com/MdAffan009/DevOps-Project.git main
            '''
            }
        }
    }

        //CD
   

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
                    kubectl apply -f k8/
                    kubectl rollout status deployment/app-deployment  

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
            sh 'docker logout || true'
            cleanWs()
        }
    }
}