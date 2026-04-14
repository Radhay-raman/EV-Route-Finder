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
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                bat "docker build -t %DOCKER_IMAGE% ."
            }
        }
        
        stage('Run Container') {
            steps {
                echo 'Stopping and removing old container (if exists)...'
                bat '''
                docker stop %CONTAINER_NAME%
                docker rm %CONTAINER_NAME%
                '''
                
                echo 'Running new container...'
                bat '''
                docker run -d -p %PORT%:%PORT% --name %CONTAINER_NAME% %DOCKER_IMAGE%
                '''
            }
        }
    }
}