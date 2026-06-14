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


        stage('Debug') {

            when {
                branch 'test'
            }

            steps {

            withCredentials([
               file(credentialsId: 'kubeconfig',variable: 'KUBECONFIG'),
               file(credentialsId: 'helm-secret-values', variable: 'HELM_SECRETS')
            ]) {

            sh '''
                cat $HELM_SECRETS
                kubectl config current-context
                kubectl cluster-info

                helm upgrade --install webapp ./chart -f chart/values.yaml -f $HELM_SECRETS
                kubectl rollout status deployment/webapp-deployment

            '''
            }
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
                 curl -X POST \
                -H "Authorization: token ${GIT_PASS}" \
                -H "Accept: application/vnd.github.v3+json" \
                https://api.github.com/repos/MdAffan009/DevOps-Project/pulls \
                -d '{
                 "title": "CI Passed — Merge test into main",
                 "head": "test",
                 "base": "main",
                 "body": "All tests passed. Ready for review."
                 }' || echo "PR may already exist, skipping"
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

        steps {

            withCredentials([
               file(credentialsId: 'kubeconfig',variable: 'KUBECONFIG'),
               file(credentialsId: 'helm-secret-values', variable: 'HELM_SECRETS')
            ]) {

            sh '''
                kubectl config current-context
                kubectl cluster-info

                helm upgrade --install webapp ./chart -f chart/values.yaml -f $HELM_SECRETS
                kubectl rollout status deployment/webapp-deployment
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
            sh 'docker logout || true'
            cleanWs()
        }
    }
}
