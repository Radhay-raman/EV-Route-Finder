pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'ev-route-finder'
        CONTAINER_NAME = 'ev-route-app'
        PORT = '3000'
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                echo 'Checking out source code...'
                // For a real repository, this would be: checkout scm
                // We use checkout scm if connected to a repo.
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                // Using bat for Windows Jenkins node
                bat "docker build -t ${env.DOCKER_IMAGE} ."
            }
        }
        
        stage('Run Container') {
            steps {
                echo 'Stopping existing container if running...'
                catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                    bat "docker stop ${env.CONTAINER_NAME}"
                    bat "docker rm ${env.CONTAINER_NAME}"
                }
                
                echo 'Starting new container...'
                bat "docker run -d -p ${env.PORT}:${env.PORT} --name ${env.CONTAINER_NAME} ${env.DOCKER_IMAGE}"
            }
        }
    }
}
