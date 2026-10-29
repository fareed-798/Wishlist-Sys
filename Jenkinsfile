
pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout Source') {
            steps {
                checkout scm
                echo 'Wishlist System source checked out.'
            }
        }

        stage('Check Node.js') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Validate Application') {
            steps {
                bat 'npm run check'
            }
        }
    }

    post {
        success {
            echo 'Wishlist System CI pipeline succeeded.'
        }
        failure {
            echo 'Wishlist System CI pipeline failed.'
        }
    }
}