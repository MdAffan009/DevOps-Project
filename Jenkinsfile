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
            when {
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
        stage('Docker Build') {
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

        stage('Update Config Repo') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-creds',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_PASS'
                )]) {
                    sh '''
                        git clone https://${GIT_USER}:${GIT_PASS}@github.com/MdAffan009/devops-config.git
                        cd devops-config

                        sed -i "s/tag:.*/tag: \\"${BUILD_NUMBER}\\"/" apps/webapp/values.yaml

                        git config user.email "jenkins@devops.local"
                        git config user.name "Jenkins"

                        git add apps/webapp/values.yaml
                        git commit -m "Update image tag to ${BUILD_NUMBER}"
                        git push
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