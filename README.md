# 시각 장애인 버스 알리미
<br>

## 사이트 주소
https://gis-alpha.vercel.app/

## 프로젝트 소개
시각에 불편이 있는 분이 버스를 탈 때 근처 정류장 찾기, 원하는 버스 도착 알림을 돕는 웹 앱입니다.

## 개발 환경

### Backend
|분류|기술스택|
|------|---|
|Language|<img src="https://img.shields.io/badge/Java 17-007396?style=for-the-badge&logo=java&logoColor=white">|
|Framework|<img src="https://img.shields.io/badge/Spring Boot 3.2.2-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white"> <img src="https://img.shields.io/badge/Spring Security-6DB33F?style=for-the-badge&logo=SpringSecurity&logoColor=white">|
|ORM|<img src="https://img.shields.io/badge/Spring Data JPA-6DB33F?style=for-the-badge&logo=&logoColor=white"> <img src="https://img.shields.io/badge/QueryDSL-0088CC?style=for-the-badge&logo=&logoColor=white">|
|Authentication|<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSONWebTokens&logoColor=white">|
|Cloud Storage|<img src="https://img.shields.io/badge/AWS S3-569A31?style=for-the-badge&logo=AmazonS3&logoColor=white">|
|Container|<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white">|

### Frontend
|분류|기술스택|
|------|---|
|Language|<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white">|
|Framework|<img src="https://img.shields.io/badge/React 18.2-61DAFB?style=for-the-badge&logo=React&logoColor=black">|
|HTTP Client|<img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=Axios&logoColor=white">|
|Container|<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white"> <img src="https://img.shields.io/badge/Node.js 20-339933?style=for-the-badge&logo=Node.js&logoColor=white">|

### DevOps
|분류|기술스택|
|------|---|
|CI/CD|<img src="https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=Jenkins&logoColor=white">|
|Container|<img src="https://img.shields.io/badge/Docker Compose-2496ED?style=for-the-badge&logo=Docker&logoColor=white">|

## 아키텍처
### 운영환경 아키텍처
<img width="700" alt="gis drawio" src="https://github.com/user-attachments/assets/0bcf65d4-3979-4de8-97b3-05c9eab3bcda" />
<br clear="left">

### 개발환경 아키텍처
<img width="700" alt="kiosk drawio의 사본 drawio" src="https://github.com/user-attachments/assets/b2e91298-f8a6-4e6c-9f1c-5b1c06a1126e" />
<br clear="left"><br>

## 테이블 설계
<img width="700" alt="image" src="https://github.com/user-attachments/assets/8a22313c-e535-4899-99aa-6f43d6f7db20" />
<br clear="left"><br>

## 주요 기능

### 1. 로그인 페이지

- **바리스타**는 로그인하여 주문관리, 주문 등록, 메뉴 관리를 할 수 있다.
- 계정이 없는 경우 **키오스크 이용하기**를 클릭하여 일반 손님들이 메뉴를 주문할 수 있다.

<img width="400" alt="localhost_3030_(iPad Air)" src="https://github.com/user-attachments/assets/ebd01591-6d6b-4b7a-a5a4-142bc3dd87f7"/>

<br clear="left"><br>

### 2. 키오스크 화면

- 손님이 원하는 메뉴, 개수, 온도를 선택하고 주문이 완료되면 실시간으로 바리스타에게 전송된다.

<img width="500" alt="localhost_3030_kiosk(iPad Air) (1)" src="https://github.com/user-attachments/assets/dc7c4b6f-4035-4cc0-a7ef-90ea42161113"/>

<br clear="left"><br>

### 3. 바리스타 화면

#### 3.1 주문관리

- 좌측 화면에서는 키오스크와 마찬가지로 주문할 메뉴, 개수, 온도를 선택할 수 있다.
- 우측 화면에서는 주문이 완료된 주문 내역을 확인하고 **진행단계**를 설정한다. (대기 - 진행 중 - 완료)

<img width="800" alt="localhost_3030_barista(Galaxy Tab S4) (2)" src="https://github.com/user-attachments/assets/cf30e545-7c59-4c4a-8763-1c482122570d"/>

<br clear="left"><br>

#### 3.2 메뉴 관리

- 카테고리를 추가, 수정, 삭제할수 있다.
- 카테고리별 메뉴의 메뉴명, 이미지, 가격, 온도를 추가, 수정, 삭제할 수 있다.

<img width="700" alt="localhost_3030_barista(Galaxy Tab S4) (4)" src="https://github.com/user-attachments/assets/4128929b-b47f-422b-901b-3f44c37f81e7" />

<br clear="left"><br>

## 기술적 고민과 선택

### 1. 실시간 주문 알림 구현
**문제 상황**
- 키오스크에서 주문이 들어오면 바리스타 화면에 실시간으로 알림이 필요
- 주문 누락 방지와 빠른 응대가 핵심 요구사항

**고려한 방안**
- **WebSocket**: 양방향 통신이 가능하지만, 서버→클라이언트 단방향 알림만 필요해서 오버스펙
- **Polling**: 구현은 간단하지만 주기적인 요청으로 인한 서버 부담과 네트워크 낭비
- **SSE (Server-Sent Events)**: HTTP 기반 단방향 실시간 통신, 가벼운 구현

**선택 및 결과**
- **SSE** 선택: 서버→클라이언트 단방향 통신으로 요구사항에 적합
- 자동 재연결 기능으로 안정적인 연결 유지
- 웹 표준 기술로 추가 라이브러리 없이 구현 가능

### 2. 동적 쿼리 처리 - QueryDSL
**문제 상황**
- 메뉴 검색 시 카테고리, 가격, 온도 등 다양한 조건의 조합 필요
- JPQL로 작성 시 문자열 기반이라 오타 발생 시 런타임 에러 위험

**선택 및 결과**
- **QueryDSL** 도입으로 컴파일 타임에 쿼리 검증 가능
- 타입 안정성 확보 및 IDE 자동완성으로 개발 생산성 향상
- 복잡한 동적 쿼리를 Java 코드로 직관적으로 작성

### 3. 인증/인가 - JWT
**문제 상황**
- 바리스타 전용 기능(주문관리, 메뉴 관리)과 일반 키오스크 기능 분리 필요
- 세션 방식은 서버 확장 시 세션 공유 문제 발생 가능

**선택 및 결과**
- **JWT (JSON Web Token)** 기반 Stateless 인증 구현
- 서버 메모리 부담 없이 확장성 확보
- Spring Security와 통합하여 역할 기반 접근 제어 구현

### 4. 이미지 저장소 - AWS S3
**문제 상황**
- 메뉴 이미지를 서버 로컬에 저장 시 서버 재배포/확장 시 이미지 유실 위험
- Docker 컨테이너 환경에서 이미지 영속성 보장 필요

**선택 및 결과**
- **AWS S3** 사용으로 안정적인 이미지 저장소 확보
- CDN 연동 가능성 확보로 향후 성능 개선 여지 확보
- 백업 및 버전 관리 용이

### 5. 컨테이너화 - Docker & Docker Compose
**문제 상황**
- 개발 환경과 운영 환경의 차이로 인한 "내 컴퓨터에선 되는데" 문제
- 팀원 간 환경 설정 통일 필요

**선택 및 결과**
- **Docker**로 애플리케이션 컨테이너화
- **Docker Compose**로 백엔드, 프론트엔드, DB를 한 번에 실행
- 환경 일관성 확보 및 배포 자동화 기반 마련

