pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    booleanParam(
      name: 'RUN_DEPLOY',
      defaultValue: false,
      description: '체크 시 deploy-simple.sh 실행 (젠킨스 에이전트가 배포 서버와 동일한 머신일 때만 사용)'
    )
    booleanParam(
      name: 'SKIP_DOCKER_BUILD',
      defaultValue: false,
      description: '체크 시 Docker 빌드 단계 생략 (에이전트에 Docker 없을 때)'
    )
  }

  environment {
    // 필요 시 Jenkins Credentials / 전역 환경 변수로 설정
    // NPM_CONFIG_PRODUCTION = 'false'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend — Gradle test & bootJar') {
      steps {
        dir('gis-be') {
          sh 'chmod +x gradlew'
          sh './gradlew --no-daemon clean test bootJar'
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'gis-be/build/test-results/test/*.xml'
        }
      }
    }

    stage('Frontend — npm build') {
      steps {
        dir('gis-fe') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Docker — compose build (spring-boot)') {
      when {
        expression { return !params.SKIP_DOCKER_BUILD }
      }
      steps {
        sh 'docker-compose build spring-boot'
      }
    }

    stage('Deploy') {
      when {
        allOf {
          anyOf {
            branch 'main'
            branch 'master'
          }
          expression { return params.RUN_DEPLOY }
        }
      }
      steps {
        sh 'bash deploy-simple.sh'
      }
    }
  }

  post {
    failure {
      echo 'Pipeline failed — 로그를 확인하세요.'
    }
    success {
      echo 'Pipeline succeeded.'
    }
  }
}
