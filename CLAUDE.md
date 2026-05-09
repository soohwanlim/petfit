# PetFit — Project Map

## What This Service Does
- Recommends pet insurance riders based on cat breed-specific genetic disease data
- Target users: cat owners (dogs not supported in MVP)
- Key differentiator: scores insurance products by breed fit, not just price

## Tech Stack
- Backend:  Java 17 + Spring Boot 3.x
- DB 1:     OCI MySQL 8.4 — breed, disease, breed_disease_stats (structured, rarely changes)
- DB 2:     MongoDB Atlas M0 — insurance_products with embedded riders (semi-structured, changes often)
- Frontend: React → Cloudflare Pages (auto-deploy on push via Cloudflare GitHub integration, no GitHub Actions needed)
- Backend deploy: GitHub Actions → OCI ARM VM (SSH deploy, restart Spring Boot service)

## DB Role Separation — Critical
MySQL   = structured data: Breed, Disease, BreedDiseaseStats
MongoDB = semi-structured data: InsuranceProduct (Rider embedded inside, no separate collection)

## Folder Structure
backend/
  src/main/java/com/petfit/
    domain/          # @Entity (MySQL), @Document (MongoDB), Value Objects
    service/         # business logic
    repository/
      mysql/         # JPA implementations
      mongo/         # MongoRepository implementations
    controller/      # REST API
  src/main/resources/
    db/migration/    # Flyway migration files (MySQL only)
frontend/
  src/
    components/      # UI components
    pages/           # screens
    services/        # API calls
    hooks/           # custom hooks

## Domain Rules
- Breed, Disease, BreedDiseaseStats → @Entity (JPA, MySQL)
- InsuranceProduct → @Document (MongoDB); Rider is an embedded document, NOT a separate collection
- ScoreResult → Value Object; never persist it, recalculate on every request
- ScoreCalculator → interface; add new implementations for new scoring items, never modify existing ones (OCP)
- Layer dependency direction: Controller → Service → Repository only (no reverse dependencies)

## Always Do
- Change MySQL schema only via Flyway migration files under db/migration/ (no direct ALTER TABLE)
- When modifying MongoDB document structure, verify backward compatibility with existing documents and handle missing fields with Optional
- Require sourceUrl on Disease and BreedDiseaseStats; reject saves without it
- Store all DB credentials and API keys in application.yml + environment variables only (no hardcoding)

## Never Do
- Declare InsuranceProduct as @Entity → use @Document
- Create a separate MongoDB collection for Rider → embed inside InsuranceProduct
- Create insurance_product or rider tables in MySQL
- Persist ScoreResult to any database
- Import Service from Repository (breaks DIP)
- Add disease data without a source URL
