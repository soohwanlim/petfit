# 🐱 PetFit — 고양이 품종 맞춤 펫보험 추천 서비스

> "보험료가 싼 순"이 아닌, **"우리 아이 품종에 맞는 특약이 있는 순"** 으로 추천합니다.

[![GitHub](https://img.shields.io/badge/GitHub-soohwanlim%2Fpetfit-181717?logo=github)](https://github.com/soohwanlim/petfit)

---

## 📌 프로젝트 개요

우리 집 고양이 봄이가 밥을 안 먹어서 동물병원에 데려갔더니 기본 검진에 10만원이 나왔습니다. 그 날 처음으로 펫보험을 알아봤는데, 기존 서비스들은 보험료 가격 비교만 해줄 뿐 "우리 고양이 품종에 어떤 특약이 왜 필요한지"를 알려주지 않았습니다.

**PetFit**은 고양이 품종별 유전 질환 데이터를 기반으로, 품종에 맞는 특약이 있는 보험 상품을 적합도 점수 순으로 추천해주는 서비스입니다.

### 기존 서비스와의 차이

| | 네이버 펫보험 비교 | 아이펫 | **PetFit** |
|---|---|---|---|
| 추천 기준 | 보험료 중심 | 보장 내용·한도 비교 | **품종별 특약 적합도 점수** |
| 면책 기간 안내 | 없음 | 상품별 확인 가능 | **품종별 발병 시기 연동** |
| 품종별 질환 데이터 | 없음 | 없음 | **수의학 문헌 기반** |

---

## 🖥 프로토타입 (백엔드 없이 로컬 실행)

DB·서버 없이 바로 실행할 수 있는 정적 프로토타입입니다.  
크롤링한 실제 보험사 데이터를 기반으로 동작합니다.

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

**프로토타입 기능**
- 고양이 품종 선택 (한국어 품종명 포함, 15개)
- 고양이 나이 입력 (0~15세, 0.5 단위)
- 아팠던 곳 다중 선택 (비뇨기 / 심장 / 관절 / 피부 / 치과 / 호흡기 / 소화기 / 눈)
- 4개 보험사 적합도 점수 비교 (특약 적합도 / 보장 비율 / 면책 기간)
- 품종·병력 기반 추천 특약 표시
- 각 보험사 가입 페이지 직접 링크

---

## 🛠 기술 스택

### Backend
- **Java 17** + **Spring Boot 3.3**
- **MySQL 8.4** (OCI HeatWave Always Free) — 품종·질환·발병률 통계 (정형 데이터)
- **MongoDB Atlas M0** (영구 무료) — 보험 상품·특약 (반정형, 자주 바뀌는 데이터)
- **Flyway** — MySQL 스키마 버전 관리

### Frontend
- **React 18** + **Vite** + **Tailwind CSS**

### 배포
- **GitHub Actions** → OCI ARM VM (백엔드)
- **Cloudflare Pages** (프론트엔드, GitHub push 시 자동 배포)

### 데이터 수집
- **Playwright** + **BeautifulSoup** — 4개 보험사 자동 크롤러 (메리츠/KB/현대해상/삼성화재)
- **Claude API** — 약관 PDF 구조화 파서

---

## 🏗 아키텍처

### DB 분리 전략

```
MySQL 8.4 (정형 데이터 — 잘 안 바뀜)
├── breed               품종 (15개)
├── disease             질환 (7개, 출처 URL 필수)
└── breed_disease_stats 품종별 발병률 통계 (0~14세 배열)

MongoDB Atlas (반정형 데이터 — 자주 바뀜)
└── insurance_products  보험 상품 + 특약 내장 Document
```

보험 상품은 매년 약관이 개정되고 특약이 추가·삭제됩니다.  
MongoDB Document 구조는 새 필드가 추가되어도 기존 상품에 영향이 없어 유연하게 대응할 수 있습니다.

### 레이어 구조

```
Controller → Service → Repository (interface)
                            ↓               ↓
                       JPA 구현체    MongoRepository 구현체
                        (MySQL)          (MongoDB)
```

### SOLID 원칙 적용

| 원칙 | 적용 지점 |
|---|---|
| **SRP** | 점수 계산(`ScoreCalculator`), 추천 조합(`RecommendationService`), 데이터(`InsuranceProduct`) 분리 |
| **OCP** | `ScoreCalculator` 인터페이스 — 새 점수 항목은 새 구현체 추가, 기존 코드 수정 없음 |
| **LSP** | `ScoreCalculator` 구현체는 Mock으로 교체해도 동일 동작 |
| **ISP** | `BreedDiseaseStatsRepository` / `InsuranceProductRepository` 분리 |
| **DIP** | Service 계층은 Repository 구현체가 아닌 인터페이스에 의존 |

---

## 📊 핵심 기능

### 1. 품종별 특약 적합도 점수화

보험 상품을 3개 항목으로 점수화해 내림차순 정렬합니다.

```
총점 = 특약 적합도 (품종 취약 질환 × 발병률 가중치)
     + 보장 비율 (70% / 80% / 90%)
     + 면책 기간 타이밍 (현재 나이 + 면책 기간 vs 평균 발병 나이)
```

### 2. 발병률 그래프 + 면책 기간 오버레이

품종·질병을 선택하고 현재 나이를 입력하면,  
나이별 누적 발병률 곡선 위에 면책 기간 구간이 오버레이됩니다.

### 3. 보험사 데이터 자동 수집 크롤러

Playwright 헤드리스 브라우저로 4개 보험사 상품 페이지를 크롤링하고,  
SHA-256 해시 비교로 약관 변경을 자동 탐지합니다.

```bash
cd backend/tools/crawler
pip install -r requirements.txt
python3 crawl.py
```

---

## 🗂 프로젝트 구조

```
petfit/
├── backend/
│   ├── src/main/java/com/petfit/
│   │   ├── domain/          # @Entity (MySQL), @Document (MongoDB), VO
│   │   ├── service/
│   │   │   └── scoring/     # ScoreCalculator 인터페이스 + 구현체
│   │   ├── repository/
│   │   │   ├── mysql/       # JPA 구현체
│   │   │   └── mongo/       # MongoRepository 구현체
│   │   └── controller/      # REST API + DTO
│   ├── src/main/resources/
│   │   └── db/migration/    # Flyway V1~V6
│   └── tools/
│       ├── crawler/         # Playwright 크롤러 (4개 보험사)
│       └── pdf-parser/      # Claude API 약관 PDF 파서
└── frontend/
    └── src/
        ├── data/            # 정적 데이터 (breeds.js, diseases.js, insuranceProducts.js)
        ├── components/      # ScoreBadge, BreedSelector, RecommendationCard
        ├── pages/           # HomePage
        ├── hooks/           # useBreeds, useRecommendations
        └── services/        # staticApi.js (프로토타입) / api.js (백엔드 연동)
```

---

## 📡 API

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/breeds` | 품종 목록 |
| GET | `/api/breeds/{id}/diseases` | 품종별 취약 질환 + 위험도 |
| GET | `/api/recommendations?breedId=&catAge=` | 적합도 점수 내림차순 보험 추천 |
| GET | `/api/products` | 보험 상품 전체 목록 |
| POST | `/api/products` | 보험 상품 등록 (관리자) |

---

## 🚀 백엔드 실행 방법

### 환경변수 설정

```bash
export MYSQL_URL=jdbc:mysql://localhost:3306/petfit
export MYSQL_USER=petfit
export MYSQL_PASSWORD=petfit
export MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/petfit
```

### 실행

```bash
cd backend
mvn spring-boot:run
# http://localhost:8080
```

---

## 📝 개발 배경 및 기록

- **[PetFit 개발기 시리즈 (Velog)](https://velog.io/@soohwanlim/PetFit-%EA%B0%9C%EB%B0%9C%EA%B8%B0-0-%EB%B0%98%EB%A0%A4%EB%8F%99%EB%AC%BC-%EB%B3%91%EC%9B%90%EB%B9%84-%EB%84%88%EB%AC%B4-%EB%B9%84%EC%8B%B8%EB%8B%A4)** — 도메인 분석, User Story, SOLID 설계, 구현 후기

---

## 📄 라이선스

MIT License
