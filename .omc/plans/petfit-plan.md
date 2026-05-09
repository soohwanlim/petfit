# PetFit — Implementation Plan

**Date:** 2026-04-28  
**Status:** Draft  
**Scope:** Greenfield build — 0% complete

---

## Requirements Summary

PetFit recommends cat insurance riders based on breed-specific genetic disease risk data.
- Input: cat breed selected by owner
- Output: ranked list of insurance products with rider fit scores
- MVP: cats only, no dog support
- Key differentiator: breed-fit scoring, not price sorting

---

## Acceptance Criteria

| # | Criterion | Testable |
|---|-----------|----------|
| AC-1 | `GET /api/breeds` returns all breeds with id + name | ✓ HTTP 200, non-empty list |
| AC-2 | `GET /api/recommendations?breedId=<id>` returns products sorted by score desc | ✓ first item has highest score |
| AC-3 | ScoreResult is never stored in MySQL or MongoDB | ✓ no score column in any table/doc |
| AC-4 | Disease and BreedDiseaseStats rejected without sourceUrl | ✓ POST returns 400 when sourceUrl missing |
| AC-5 | InsuranceProduct stored only in MongoDB as @Document | ✓ no insurance_product table in MySQL |
| AC-6 | Rider embedded in InsuranceProduct, no separate Rider collection | ✓ MongoDB has single products collection |
| AC-7 | MySQL schema changes only via Flyway | ✓ no ALTER TABLE outside migrations |
| AC-8 | Adding new ScoreCalculator impl does not modify existing impls | ✓ OCP: existing files unchanged |
| AC-9 | Frontend shows breed picker and ranked recommendation cards | ✓ manual UI smoke test |
| AC-10 | Credentials stored only in application.yml + env vars | ✓ grep for hardcoded passwords returns nothing |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| MongoDB Atlas M0 free tier connection limits | Medium | Medium | Connection pool max=5 in MongoClient config |
| Dual-datasource Spring Boot misconfiguration (JPA + Mongo) | High | High | Separate @Configuration classes; disable Spring Boot auto-config for one |
| Flyway runs against MongoDB (unsupported) | Medium | High | Set `spring.flyway.url` to MySQL only; exclude MongoDB from Flyway config |
| OCI ARM VM SSH deploy fails on first run | Medium | Low | Test deploy script locally with SSH key before wiring GitHub Actions |
| React CORS errors hitting Spring Boot | Medium | Medium | Add `@CrossOrigin` or configure CorsRegistry in WebMvcConfigurer |

---

## Phase 1 — Project Scaffolding

**Goal:** Runnable skeleton with both databases connected.

### 1.1 Backend (Maven)

**File:** `backend/pom.xml`

Dependencies:
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-data-mongodb`
- `mysql-connector-j`
- `flyway-core` + `flyway-mysql`
- `lombok`
- `spring-boot-starter-validation`
- `spring-boot-starter-test`

**File:** `backend/src/main/java/com/petfit/PetFitApplication.java`
```java
@SpringBootApplication
public class PetFitApplication {
    public static void main(String[] args) {
        SpringApplication.run(PetFitApplication.class, args);
    }
}
```

### 1.2 Backend Configuration

**File:** `backend/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: ${MYSQL_URL}
    username: ${MYSQL_USER}
    password: ${MYSQL_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  data:
    mongodb:
      uri: ${MONGODB_URI}
      database: petfit
  flyway:
    enabled: true
    locations: classpath:db/migration
```

**Separate `@Configuration` for MongoDB** to avoid JPA auto-config conflicts:
- `backend/src/main/java/com/petfit/config/MongoConfig.java`
- `backend/src/main/java/com/petfit/config/JpaConfig.java`

### 1.3 Frontend (React + Vite)

```
frontend/
  package.json        (vite, react, react-dom, axios)
  vite.config.js      (proxy /api → http://localhost:8080)
  src/
    main.jsx
    App.jsx
    components/
    pages/
    services/
    hooks/
```

**Acceptance:** `./mvnw spring-boot:run` starts without error; `npm run dev` opens localhost:5173.

---

## Phase 2 — Domain Modeling

**Goal:** All entities and documents defined with correct annotations.

### 2.1 MySQL Entities (`domain/`)

**`Breed.java`** — `@Entity`, table `breed`
```
id          BIGINT PK AUTO_INCREMENT
name        VARCHAR(100) NOT NULL UNIQUE
description TEXT
```

**`Disease.java`** — `@Entity`, table `disease`
```
id          BIGINT PK AUTO_INCREMENT
name        VARCHAR(200) NOT NULL
description TEXT
sourceUrl   VARCHAR(500) NOT NULL   ← validated @NotBlank
```

**`BreedDiseaseStats.java`** — `@Entity`, table `breed_disease_stats`
```
id              BIGINT PK AUTO_INCREMENT
breed_id        BIGINT FK → breed.id
disease_id      BIGINT FK → disease.id
prevalenceRate  DOUBLE (0.0–1.0)
severity        ENUM('LOW','MEDIUM','HIGH')
sourceUrl       VARCHAR(500) NOT NULL   ← validated @NotBlank
```

### 2.2 MongoDB Document (`domain/`)

**`InsuranceProduct.java`** — `@Document(collection="insurance_products")`
```
id          String (MongoDB ObjectId)
productName String
provider    String
monthlyPremium Double
riders      List<Rider>   ← embedded, NOT separate collection
```

**`Rider.java`** — plain class (no @Document, no @Entity)
```
riderName       String
coveredDiseases List<String>   ← disease names or IDs
coverageLimit   Double
```

### 2.3 Value Object

**`ScoreResult.java`** — no persistence annotations
```
InsuranceProduct product
double           score        (0.0–100.0)
List<String>     matchedRiders
```

**Acceptance:** `./mvnw compile` with zero errors; `@Entity` grep finds only Breed/Disease/BreedDiseaseStats; `@Document` grep finds only InsuranceProduct.

---

## Phase 3 — Database Migrations & Seed Data

**Goal:** MySQL schema via Flyway; MongoDB seed data via data loader.

### 3.1 Flyway Migrations (MySQL only)

```
backend/src/main/resources/db/migration/
  V1__create_breed.sql
  V2__create_disease.sql
  V3__create_breed_disease_stats.sql
  V4__seed_breeds.sql          (10–20 common cat breeds)
  V5__seed_diseases.sql        (genetic diseases with sourceUrl)
  V6__seed_breed_disease_stats.sql
```

**V1:** CREATE TABLE breed (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, description TEXT)
**V2:** CREATE TABLE disease (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(200) NOT NULL, description TEXT, source_url VARCHAR(500) NOT NULL)
**V3:** CREATE TABLE breed_disease_stats (id BIGINT AUTO_INCREMENT PRIMARY KEY, breed_id BIGINT NOT NULL, disease_id BIGINT NOT NULL, prevalence_rate DOUBLE NOT NULL, severity ENUM('LOW','MEDIUM','HIGH') NOT NULL, source_url VARCHAR(500) NOT NULL, FOREIGN KEY (breed_id) REFERENCES breed(id), FOREIGN KEY (disease_id) REFERENCES disease(id))

Sample breeds: Maine Coon, Persian, Siamese, Ragdoll, Bengal, British Shorthair, Scottish Fold, Sphynx, Abyssinian, Norwegian Forest Cat

Sample diseases with sourceUrl pointing to published veterinary sources:
- Hypertrophic Cardiomyopathy (HCM)
- Polycystic Kidney Disease (PKD)
- Progressive Retinal Atrophy (PRA)
- Hip Dysplasia
- Pyruvate Kinase Deficiency

### 3.2 MongoDB Seed Data

**`backend/src/main/java/com/petfit/config/MongoDataLoader.java`** — `@Component implements CommandLineRunner`

Runs only when `insurance_products` collection is empty. Seeds 5–10 insurance products each with 2–4 embedded riders covering different disease sets.

**Acceptance:** After startup, MySQL has all tables populated; `db.insurance_products.countDocuments()` > 0 in MongoDB Atlas shell.

---

## Phase 4 — Scoring Engine

**Goal:** Extensible scoring that ranks products by breed-disease fit without persisting results.

### 4.1 ScoreCalculator Interface

**`service/scoring/ScoreCalculator.java`**
```java
public interface ScoreCalculator {
    double calculate(List<BreedDiseaseStats> breedStats, InsuranceProduct product);
}
```

### 4.2 Implementations (OCP — never modify existing, add new classes)

**`service/scoring/DiseaseMatchScoreCalculator.java`** — scores by how many breed diseases are covered by product riders
- For each rider: check if coveredDiseases intersects with breedStats disease names
- Score = (matched diseases / total breed diseases) * 100 * prevalence weight

**`service/scoring/SeverityWeightScoreCalculator.java`** — multiplies match score by severity weight
- HIGH → 1.5x, MEDIUM → 1.0x, LOW → 0.5x

### 4.3 CompositeScoreCalculator

**`service/scoring/CompositeScoreCalculator.java`** — `@Service`
- Injects `List<ScoreCalculator>` (Spring collects all implementations)
- Sums and normalizes scores from all calculators
- Returns final `double` score

### 4.4 RecommendationService

**`service/RecommendationService.java`** — `@Service`
```
getRecommendations(Long breedId) → List<ScoreResult>
  1. load BreedDiseaseStats by breedId from MySQL
  2. load all InsuranceProducts from MongoDB
  3. for each product: score = compositeCalculator.calculate(stats, product)
  4. return List<ScoreResult> sorted by score desc
  → never persist ScoreResult
```

**Acceptance:** Unit test with mock data asserts products with full disease coverage rank above products with none; `ScoreResult` class has no `@Entity`/`@Document` annotations.

---

## Phase 5 — REST API

**Goal:** JSON endpoints consumed by the frontend.

### 5.1 Endpoints

| Method | Path | Description | Returns |
|--------|------|-------------|---------|
| GET | `/api/breeds` | List all breeds | `List<BreedDto>` |
| GET | `/api/breeds/{id}` | Single breed detail | `BreedDto` |
| GET | `/api/recommendations?breedId={id}` | Scored recommendations for breed | `List<RecommendationDto>` |
| GET | `/api/products` | List all insurance products (admin) | `List<ProductDto>` |
| POST | `/api/products` | Add new product (admin) | `ProductDto` 201 |

### 5.2 Controller Classes

**`controller/BreedController.java`** — `@RestController`, `@RequestMapping("/api/breeds")`
→ calls `BreedService`

**`controller/RecommendationController.java`** — `@RestController`, `@RequestMapping("/api/recommendations")`
→ calls `RecommendationService.getRecommendations(breedId)`

**`controller/ProductController.java`** — `@RestController`, `@RequestMapping("/api/products")`
→ calls `InsuranceProductService`

### 5.3 DTOs

Separate DTO classes in `controller/dto/` — never expose @Entity or @Document directly:
- `BreedDto` (id, name, description)
- `RecommendationDto` (productId, productName, provider, monthlyPremium, score, matchedRiders)
- `ProductDto` (id, productName, provider, monthlyPremium, riders)

### 5.4 Error Handling

**`controller/GlobalExceptionHandler.java`** — `@RestControllerAdvice`
- `MethodArgumentNotValidException` → 400 with field errors
- `EntityNotFoundException` → 404
- Generic `Exception` → 500

### 5.5 CORS

**`config/WebConfig.java`** — `@Configuration implements WebMvcConfigurer`
- Allow origin: `https://petfit.pages.dev` (Cloudflare Pages URL)
- Allow origin for dev: `http://localhost:5173`

**Acceptance:** `curl http://localhost:8080/api/breeds` returns JSON array; `curl http://localhost:8080/api/recommendations?breedId=1` returns sorted list; POST without sourceUrl returns 400.

---

## Phase 6 — Frontend UI

**Goal:** React SPA with breed picker and recommendation cards.

### 6.1 Pages

**`pages/HomePage.jsx`**
- Breed picker dropdown (fetches `/api/breeds`)
- On selection → fetches `/api/recommendations?breedId=<id>`
- Renders `<RecommendationList />`

**`pages/ProductDetailPage.jsx`** (optional / stretch)
- Shows full product detail with all riders

### 6.2 Components

**`components/BreedSelector.jsx`**
- `<select>` populated from API
- calls `onBreedSelect(breedId)` prop

**`components/RecommendationList.jsx`**
- Renders sorted list of `<RecommendationCard />`

**`components/RecommendationCard.jsx`**
- Shows: productName, provider, monthlyPremium, score badge, matched riders chips

**`components/ScoreBadge.jsx`**
- Color-coded: green (≥70), yellow (40–69), red (<40)

### 6.3 Services

**`services/api.js`**
```js
const BASE = import.meta.env.VITE_API_URL || '/api';
export const getBreeds = () => axios.get(`${BASE}/breeds`);
export const getRecommendations = (breedId) => axios.get(`${BASE}/recommendations`, { params: { breedId } });
```

### 6.4 Custom Hooks

**`hooks/useBreeds.js`** — fetches breeds on mount, returns `{ breeds, loading, error }`  
**`hooks/useRecommendations.js`** — fetches when breedId changes, returns `{ recommendations, loading, error }`

### 6.5 Styling

Tailwind CSS — utility classes only, no custom CSS files.

**Acceptance:** Select a breed → recommendation cards appear sorted by score; score badge color matches threshold; loading state shown during fetch.

---

## Phase 7 — Deployment

**Goal:** Automated backend deploy to OCI ARM VM; frontend auto-deploys via Cloudflare.

### 7.1 Backend — GitHub Actions

**`.github/workflows/deploy-backend.yml`**
```yaml
on:
  push:
    branches: [main]
    paths: [backend/**]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '17', distribution: 'temurin' }
      - run: cd backend && ./mvnw package -DskipTests
      - uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.OCI_HOST }}
          username: ${{ secrets.OCI_USER }}
          key: ${{ secrets.OCI_SSH_KEY }}
          source: backend/target/petfit-*.jar
          target: /opt/petfit/
      - uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.OCI_HOST }}
          username: ${{ secrets.OCI_USER }}
          key: ${{ secrets.OCI_SSH_KEY }}
          script: |
            systemctl restart petfit
```

GitHub Secrets required: `OCI_HOST`, `OCI_USER`, `OCI_SSH_KEY`, `MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MONGODB_URI`

### 7.2 OCI VM Setup (one-time manual)

- Install Java 17: `sudo apt install openjdk-17-jre-headless`
- Create systemd service `/etc/systemd/system/petfit.service`:
  ```
  [Unit]
  Description=PetFit Spring Boot
  After=network.target
  
  [Service]
  User=petfit
  EnvironmentFile=/opt/petfit/.env
  ExecStart=java -jar /opt/petfit/petfit-latest.jar
  Restart=always
  
  [Install]
  WantedBy=multi-user.target
  ```
- `/opt/petfit/.env` holds MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, MONGODB_URI

### 7.3 Frontend — Cloudflare Pages

- Cloudflare Pages connected to GitHub repo
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`
- Environment variable: `VITE_API_URL=https://api.petfit.your-domain.com`
- Auto-deploys on push to main (no GitHub Actions needed)

---

## Implementation Order

```
Phase 1  Scaffolding          ← unblocks everything
Phase 2  Domain Modeling      ← unblocks Phase 3 + 4
Phase 3  Migrations + Seed    ← unblocks Phase 4 (needs real data)
Phase 4  Scoring Engine       ← unblocks Phase 5
Phase 5  REST API             ← unblocks Phase 6
Phase 6  Frontend             ← unblocks Phase 7 (full smoke test)
Phase 7  Deployment           ← final
```

Phases 3 (seed data) and parts of Phase 6 (components) can proceed in parallel with Phase 4 once domain models are stable.

---

## Verification Steps

1. `./mvnw test` — all unit tests pass
2. `curl /api/breeds` — returns ≥10 breeds
3. `curl /api/recommendations?breedId=1` — returns ≥3 products sorted by score desc
4. `POST /api/products` without `sourceUrl` — returns HTTP 400
5. MongoDB shell: `db.insurance_products.findOne()` has embedded `riders` array
6. MySQL: `SHOW TABLES` has `breed`, `disease`, `breed_disease_stats` only (no insurance_product)
7. `grep -r "@Transient\|@Entity" InsuranceProduct.java` — no @Entity annotation found
8. `grep -r "ScoreResult" --include="*.java" | grep -i "save\|persist\|insert"` — zero matches
9. Frontend: select Maine Coon → cards appear; HCM-covering products score higher than non-covering
10. `grep -r "password\|uri" backend/src --include="*.java"` — zero hardcoded credentials

---

## ADR — Architecture Decision Record

**Decision:** Dual-datasource Spring Boot with MySQL (JPA/Flyway) for structured reference data and MongoDB Atlas for semi-structured insurance product catalog.

**Drivers:**
1. Disease/breed data is relational, stable, and benefits from FK integrity and schema migrations
2. Insurance product/rider structure changes frequently and varies by provider — fits document model
3. ScoreResult is derived, not stored — recalculation on demand avoids stale score bugs

**Alternatives Considered:**
- *MySQL only (JSON column for riders):* Simpler ops, but JSON column querying is clunky and rider schema evolution is harder
- *MongoDB only:* Loses FK integrity between breed/disease, harder to enforce sourceUrl at DB level
- *PostgreSQL + JSONB:* Better JSON than MySQL, but OCI MySQL 8.4 is already provisioned

**Why Chosen:** Dual-DB matches the domain split: structured reference data (rarely changes) vs semi-structured catalog (changes often). The separation also keeps Flyway migrations clean and scoped.

**Consequences:**
- Two connection pools to manage; two sets of credentials in env vars
- Spring Boot dual-datasource config requires careful `@Primary` annotation on the JPA datasource
- Developers need both MySQL client and MongoDB shell for local debugging

**Follow-ups:**
- Evaluate caching (Spring Cache + Caffeine) on `getRecommendations` once prod load is known
- Consider OpenAPI/Swagger doc generation via `springdoc-openapi`
- Add pagination to `/api/products` once catalog grows beyond 20 items
