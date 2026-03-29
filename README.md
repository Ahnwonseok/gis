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
|Database|<img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"> <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white">|
|Container|<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white">|

### Frontend
|분류|기술스택|
|------|---|
|Language|  <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">|
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
<img width="600" alt="gis drawio (1)" src="https://github.com/user-attachments/assets/c10c3eb5-f1c6-47d0-a761-347defc99628" />
<br clear="left">

## 주요 기능

### 1. 근처 정류장 찾기
- 현재 위치(GPS)로 가까운 정류장을 찾고, 거리·방면 정보를 제공합니다.
  <img width="600" alt="image" src="https://github.com/user-attachments/assets/307cc5dc-69e8-43ef-bc54-68870739a19a" />
<br clear="left"><br>

### 2. 정류장 버스 선택 
- 그 정류장에 오는 버스 목록을 보고, 원하는 버스 번호를 선택할 수 있습니다.
<img width="600" alt="image" src="https://github.com/user-attachments/assets/8d52ade2-dadb-43f5-a8c9-a1f94e565cc9" />
<br clear="left"><br>

### 3. 버스 도착 알림
- 선택한 버스가 정류장에 도착하기 전/후로 알림을 받을 수 있습니다.
<img width="600" alt="image" src="https://github.com/user-attachments/assets/9a825292-fab8-43dc-a537-dd926d75742a" />  
<br clear="left"><br>

### 4. 도착지 검색
- 목적지(정류장명)를 입력하면, 그곳으로 가는 노선과 근처 정류장을 찾아줍니다.
<img width="500" alt="image" src="https://github.com/user-attachments/assets/1bb0c9e9-3cb5-42f4-b105-f9df3f278b13" />
<br clear="left"><br>

### 5. OCR 버스 확인
- 카메라로 버스 번호판을 찍으면, 인식한 번호와 선택한 버스 번호가 같은지 확인해 줍니다(네이버 클로바 OCR 사용)
<img width="500" alt="image" src="https://github.com/user-attachments/assets/10a122e4-335d-4e33-b4f3-204f3d0da722" />
<br clear="left"><br>

### 6. 실시간 위치 공유(양방향)
- **같은 링크(방 ID)**로 들어온 참가자끼리 카카오 지도에서 서로의 위치를 볼 수 있습니다.
- 메인 메뉴에서 들어가면 **방이 바로 생성**되고, **링크 복사**로 상대를 초대할 수 있습니다. `?share=방UUID` 형태의 URL로 참가할 수도 있습니다.
- 브라우저 **Geolocation**으로 내 위치를 주기적으로 서버에 반영하고, **폴링**으로 참가자 전원의 최신 좌표를 가져옵니다.
- 지도에서는 **별 마커(나)**와 **빨간 마커(다른 참가자)**로 구분하고, **나가기** 시 서버에서 해당 참가자의 핀을 제거해 상대 화면에서도 사라지게 합니다.
<img width="600" alt="image" src="https://github.com/user-attachments/assets/bf8f899d-2fa7-4155-8708-3f9dab36d0e5" />
<br clear="left"><br>

### 7. 마이페이지 · 즐겨찾기 정류장
- 자주 쓰는 **정류장을 즐겨찾기**에 저장해 두었다가 **마이페이지**에서 목록으로 확인·삭제할 수 있습니다.
<img width="600" alt="image" src="https://github.com/user-attachments/assets/68c3ead1-db3b-45ce-9b3c-f9366f565afd" />
<br clear="left"><br>
- 정류장 상세 화면에서 즐겨찾기 추가 후, 마이페이지에서 해당 정류장을 누르면 **버스/도착지 흐름으로** 바로 이어질 수 있습니다.
- 로그인 없이 **브라우저 로컬 저장소(localStorage)**에만 보관하므로, 기기·브라우저마다 목록이 독립적입니다.
<img width="500" alt="image" src="https://github.com/user-attachments/assets/0fd21e0d-116c-4832-ac20-8586590964ce" />
<br clear="left"><br>

## 기술적 고민과 선택

### 1. 외부 공공 API 호출 구조 결정(버스/정류장/도착 정보)
**문제 상황**
- 근처 정류장, 정류장 경유 노선, 버스 도착 정보는 외부 공공 API에서 제공됩니다.
- 프론트에서 외부 API를 직접 호출하면 키/로직 관리가 복잡해지고, UI에 맞는 응답 가공이 일관되지 않게 됩니다.

**고려한 방안**
- 백엔드(Spring Boot)가 외부 API를 호출하고, 프론트가 바로 쓰기 쉬운 형태로 응답을 가공

**선택 및 결과**
- **Spring Boot에서 외부 API를 호출하고**, 프론트가 바로 사용할 수 있도록 응답을 가공하도록 선택했습니다.

### 2. OCR 적용 방식 결정(클로바 OCR 연동)
**문제 상황**
- 버스 번호판 이미지를 OCR로 인식하고, 인식된 번호를 선택한 버스 번호와 비교해 신뢰도를 높여야 합니다.
- OCR API를 프론트에서 직접 호출하면 CORS 이슈가 생길 수 있고, API 키(시크릿) 노출 위험이 있습니다.

**고려한 방안**
- 백엔드가 OCR 프록시 역할을 수행(시크릿은 백엔드에만 보관)

**선택 및 결과**
- **백엔드에 엔드포인트를 두고**, Spring Boot가 클로바 OCR을 호출하도록 선택했습니다.
- 프론트는 이미지 데이터를 백엔드로 보내고, OCR 결과만 받아 UI에서 검증하도록 구성했습니다.

### 3. GPS 기반 근처 정류장 조회를 위한 HTTPS 구성
**문제 상황**
- 웹에서 GPS 기반 위치는 보안 정책(HTTPS 등)의 영향을 받기 때문에 운영 환경에서 안정성이 중요합니다.
- 사용자의 좌표를 받아 근처 정류장을 조회해야 합니다.

**고려한 방안**
- Spring Boot 단독으로 서비스
- Nginx를 두고 SSL(HTTPS)을 제공한 뒤 Spring Boot로 리버스 프록시

**선택 및 결과**
- **Nginx에서 SSL을 종료(HTTPS 제공)하고 Spring Boot로 프록시**하도록 선택했습니다.
- 도커에서 Nginx(80/443) → Spring Boot(8080) 구조로 배치해, 프론트가 안정적으로 GPS를 사용할 수 있게 했습니다.

### 4. 배포/운영 일관성을 위한 Docker Compose 전략
**문제 상황**
- 개발 PC와 운영 환경 간 네트워크/설정 차이로 인해 문제가 발생할 수 있습니다.
- Spring Boot, DB, Nginx를 함께 안정적으로 기동/재시작해야 합니다.

**고려한 방안**
- 각 서비스를 로컬에 분리 설치하고 수동 실행
- Docker Compose로 서비스 의존성과 구성을 한 번에 정의

**선택 및 결과**
- Docker Compose로 PostgreSQL + Spring Boot + Nginx를 함께 구성했습니다.

### 5. 접근성(스크린 리더) 고려
**문제 상황**
- 시각 장애인 사용자를 위해 버튼/상태/결과가 스크린 리더에서 자연스럽게 읽혀야 합니다.

**고려한 방안**
- 시각 UI 중심으로만 구성
- 스크린 리더 친화적으로 `aria-label`, `aria-live`, 역할(role) 속성을 체계적으로 적용

**선택 및 결과**
- 검색/오류/결과 상태를 `aria-live`로 전달하고 주요 UI에는 `aria-label`을 적용해 청각도 잘 사용할 수 있게 설계했습니다.
