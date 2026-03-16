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
|Framework|<img src="https://img.shields.io/badge/Spring Boot 3.2.2-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white">|
|ORM|<img src="https://img.shields.io/badge/Spring Data JPA-6DB33F?style=for-the-badge&logo=&logoColor=white"> <img src="https://img.shields.io/badge/QueryDSL-0088CC?style=for-the-badge&logo=&logoColor=white">|
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
### 시스템 아키텍처
<img width="700" alt="gis drawio" src="https://github.com/user-attachments/assets/0bcf65d4-3979-4de8-97b3-05c9eab3bcda" />
<br clear="left">

## 주요 기능

### 1. 근처 정류장 찾기
- 현재 위치(GPS)로 가까운 정류장을 찾고, 거리·방면 정보를 제공합니다.
<br clear="left"><br>

### 2. 정류장 버스 선택 
- 그 정류장에 오는 버스 목록을 보고, 원하는 버스 번호를 선택할 수 있습니다.
<br clear="left"><br>

### 3. 버스 도착 알림
- 선택한 버스가 정류장에 도착하기 전/후로 알림을 받을 수 있습니다.
<br clear="left"><br>

### 4. 도착지 검색
- 목적지(정류장명)를 입력하면, 그곳으로 가는 노선과 근처 정류장을 찾아줍니다.
<br clear="left"><br>

### 5. OCR 버스 확인
- 카메라로 버스 번호판을 찍으면, 인식한 번호와 선택한 버스 번호가 같은지 확인해 줍니다(네이버 클로바 OCR 사용)
<br clear="left"><br>
