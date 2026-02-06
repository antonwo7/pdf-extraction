## Extraction Service

**Extraction** is a service that automatically processes PDF documents uploaded to a SharePoint Online document library and turns them into text and structured data.

The system listens to Microsoft Graph webhooks for new/updated files, downloads PDFs, converts them to images, runs OCR via dedicated microservices, and (optionally) sends the extracted text to an LLM. A real-time Next.js dashboard shows the progress of every file.

---

### Key features

#### 🔔 SharePoint integration

- Microsoft Graph webhooks for document library changes (`Entradas`)
- Automatic detection of new files in a specific SharePoint document library
- Writes processing status back to a custom SharePoint column (e.g. `Estado`)

#### 📥 Ingestion & processing

- Download PDFs from SharePoint / OneDrive via Microsoft Graph
- Per-file working directories for PDF + images + logs
- Multi-page PDF → set of page images (Poppler `pdftoppm`)
- OCR for each page with aggregation into a single text payload

#### 🧠 Optional AI post-processing

- Send OCR text to an LLM (OpenAI / Azure OpenAI)
- Extract domain-specific structured fields (e.g. loan contracts, legal docs)
- Store extracted data in the database and export it later (Excel, etc.)

---

### 🖥 Frontend: real-time dashboard

- **Next.js** frontend application
- Real-time tracking of jobs and individual files via **WebSockets**
  - New files appear on the dashboard as soon as webhooks are processed
  - File status is updated live:  
    `Queued → Downloading → Converting PDF → OCR → AI processing → Exported / Failed`
- UI focused on monitoring:
  - Current queue and in-progress jobs
  - Per-file logs & status
  - Clear feedback for business users while documents are being processed

---

### 🧩 Microservices architecture

This repository contains the main **Extraction** backend and the Next.js frontend. Some heavy responsibilities are split into separate microservices (in other repositories):

- **SharePoint Gateway service**

  - Handles low-level calls to Microsoft Graph
  - Encapsulates SharePoint / OneDrive specifics

- **OCR service (Tesseract)**

  - Dockerized service with:
    - `tesseract-ocr` (CLI)
    - language packs (e.g. `eng`, `spa`)
    - PDF → PNG conversion via Poppler (`pdftoppm`)
  - Exposes an HTTP API (e.g. `/ocr`) to accept PDF/images and return plain text

- (Optionally) **AI extraction service**
  - Wrapper around OpenAI / Azure OpenAI
  - Receives OCR text, returns structured JSON

The Extraction backend talks to these microservices over HTTP / message queue.

---

### 🏗 Architecture (high-level flow)

1. User uploads one or more PDF files into a SharePoint document library (`Entradas`).
2. Microsoft Graph sends a webhook notification to:
   - `POST /api/sharepoint/webhook`
3. Extraction backend:
   - Determines which files are new
   - Creates a **Job** and **JobFiles** in the database
   - Enqueues each file for OCR
4. OCR microservice:
   - Downloads the file (via SharePoint Gateway or direct Graph link)
   - Converts PDF → images
   - Runs Tesseract on each page
   - Returns OCR text back to Extraction / persists results
5. (Optional) AI service:
   - Receives OCR text
   - Extracts structured fields
6. Extraction backend:
   - Updates file and job status
   - Writes status back to SharePoint (`Estado`)
   - Notifies the Next.js frontend over WebSockets
7. Frontend dashboard:
   - Shows jobs and file statuses in real time
   - Displays when processing is finished or failed

---

### ⚙️ Tech stack

**Languages & runtime**

- Node.js
- TypeScript

**Backend (this repo)**

- NestJS
- Prisma ORM + PostgreSQL
- Microsoft Graph API (SharePoint / OneDrive)
- Microsoft Graph webhooks (subscriptions)
- WebSockets for real-time updates to the frontend
- ngrok for local webhook development

**Frontend (this repo)**

- Next.js (React)
- WebSockets (real-time job/file status tracking)
- Tailwind or CSS-in-JS (depending on your setup)

**External microservices (separate repos)**

- **SharePoint / Graph microservice**
  - Encapsulates integration with Microsoft Graph
- **OCR microservice**
  - NestJS / Express
  - Tesseract OCR
  - Poppler (`pdftoppm`) for PDF → PNG
  - TypeORM + PostgreSQL for internal job/OCR result storage
- (Optional) **AI microservice**
  - OpenAI / Azure OpenAI client
  - Domain-specific prompts and extraction schemas

**Infrastructure & tooling**

- Docker & docker-compose
- Environment-based configuration (`.env`)
- Centralized logging

---

### Status

The project is under active development:

- Webhook → download → PDF→image → OCR pipeline is working end-to-end
- Job management, OCR microservice and Next.js dashboard are integrated
- AI extraction and performance optimizations (parallelism, batching, micro-processes) are in progress
