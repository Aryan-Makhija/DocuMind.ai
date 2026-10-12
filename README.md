# DocuMind.ai – Multi-User PDF RAG Application

<p align="center"> <img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js" /> <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react" alt="React" /> <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat&logo=typescript" alt="TypeScript" /> <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS" /> <img src="https://img.shields.io/badge/LangChain.js-RAG-1C3C3C?style=flat&logo=langchain" alt="LangChain.js" /> <img src="https://img.shields.io/badge/Pinecone-VectorDB-000000?style=flat&logo=pinecone" alt="Pinecone" /> <img src="https://img.shields.io/badge/GoogleGemini-AI-4285F4?style=flat&logo=googlegemini" alt="Google Gemini" /> <img src="https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=flat&logo=clerk" alt="Clerk" /> <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat&logo=postgresql" alt="PostgreSQL" /> <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat&logo=docker" alt="Docker" /> <img src="https://img.shields.io/badge/NGINX-LoadBalancing-009639?style=flat&logo=nginx" alt="NGINX" /> <img src="https://img.shields.io/badge/Redis-Rate_Limiting-DC382D?style=flat&logo=redis" alt="Redis" /> </p>

# 🚀 DocuMind.ai
### An AI-Powered Document Intelligence & Multi-User RAG Platform

**DocuMind.ai** is a full-stack, multi-user Retrieval-Augmented Generation (RAG) platform that enables users to upload PDF documents, manage their document library, and interact with their content through natural-language conversations.

The application is **fully containerized using Docker**, backed by **Redis** for rate limiting, and utilizes an **NGINX Reverse Proxy & Load Balancer** to distribute traffic seamlessly across scaled application instances for high availability and zero downtime.

---

# 💡 Overview

Traditional document search requires users to manually navigate large PDF files to locate relevant information. DocuMind.ai simplifies this process by combining semantic vector search, Cohere reranking, and large language models to generate context-aware answers grounded strictly in uploaded documents.

* **Instant Document Intelligence**: Upload, parse, and query PDF files within minutes.
* **Semantic Vector Search**: Powered by Google Gemini embeddings and Pinecone vector database.
* **Advanced Reranking**: Utilizes Cohere reranking to optimize context relevance before LLM generation.
* **NGINX Load Balancing**: Configured reverse proxy for high availability and traffic distribution across container instances.
* **Multi-User Data Isolation**: Securely isolates documents and conversations between users via robust ownership validation.

---

# ✨ Features

### 1. Authentication and Multi-User Support
* Secure authentication powered by Clerk (Email/Password & OAuth).
* User-specific document libraries and isolated vector retrieval spaces.
* Protected backend API routes with strict document ownership validation.

### 2. PDF Document Ingestion Pipeline
* Automated pipeline handling validation, text extraction, and smart text chunking.
* SHA-256 document hashing to detect and prevent duplicate uploads per user.
* Vector embedding generation using Google Gemini and storage in Pinecone.

### 3. Advanced Retrieval-Augmented Generation (RAG)
* Conversation-aware query rewriting for context-dependent follow-up questions.
* Semantic similarity search combined with Cohere reranking for precise context retrieval.
* Single-document or multi-document conversational scope toggles.

### 4. NGINX Load Balancing & Docker Containerization
* Pre-configured `Dockerfile`, `nginx.conf`, and `docker-compose.yml` for single-command spin-up.
* Round-robin request distribution across scaled Next.js application replicas.
* Redis integration for high-performance API rate limiting and security.

### 5. Dashboard and Analytics
* Real-time insights tracking total, processed, pending, and failed documents.
* Complete overview of active user conversations and recent library uploads.

---

# 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Server Actions, Server Components) |
| **Language** | JavaScript / TypeScript |
| **Styling** | Tailwind CSS, Shadcn UI |
| **AI Orchestration** | LangChain.js |
| **AI Models & Embeddings** | Google Gemini API, Gemini Embedding (`gemini-embedding-001`) |
| **Vector Database** | Pinecone (3072-dimensional vector index) |
| **Reranking** | Cohere API |
| **Infrastructure** | Docker, Docker Compose, NGINX Load Balancer, Redis |
| **Authentication** | Clerk Auth |
| **Database & ORM** | Neon PostgreSQL, Drizzle ORM |
| **Deployment** | Vercel / Containerized Cloud Hosting (AWS, DigitalOcean) |

---

# 📂 Architecture & Directory Structure

```text
documind/
├── app/
│   ├── api/
│   │   ├── chat/           # RAG chat & query routing APIs
│   │   ├── documents/      # PDF upload, listing, & deletion APIs
│   │   └── dashboard/      # User analytics & statistics APIs
│   └── ...
├── components/             # Reusable UI & Shadcn components
├── db/                     # Drizzle ORM schema & connection setup
│   ├── schema/             # PostgreSQL tables & relations
│   └── users/              # User data handlers
├── nginx/
│   └── nginx.conf          # NGINX reverse proxy & load balancer configuration
├── lib/                    # Shared utilities & core application logic
│   ├── rag/                # Embeddings, generation, retrieval, & vectorstore
│   ├── errors/             # Custom application error handling
│   └── utils/              # Helper functions
├── Dockerfile              # Multi-stage Docker build config
├── docker-compose.yml      # Docker Compose setup (App replicas + Redis)
├── .dockerignore           # Excluded files from Docker context
├── next.config.mjs         # Next.js configuration
└── package.json
```
⚙️ Getting Started
Choose to run DocuMind.ai locally via standard Node.js or through Docker with NGINX Load Balancing.

Prerequisites
Ensure you have the following installed:

Node.js (compatible with Next.js 16) & npm

Docker & Docker Compose (for containerized execution)

Accounts and API keys for Clerk, Google Gemini AI, Pinecone, and Cohere

⚡ NGINX Load Balancer Configuration Sample
Below is the standard nginx/nginx.conf used to route traffic across scaled Next.js application instances:

events {
    worker_connections 1024;
}

http {
    upstream documind_app {
        # Load balancing across scaled app replicas
        server app_1:3000;
        server app_2:3000;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://documind_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}

🐳 Option A: Running with Docker & NGINX (Recommended)
1: Clone the Repository

git clone <YOUR_REPOSITORY_URL>
cd documind

Configure Environment Variables
2: Create a .env.local file in the root directory:

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost

# Database (Neon Postgres)
DATABASE_URL=your_database_connection_string

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name

# Cohere Reranking
COHERE_API_KEY=your_cohere_api_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Redis Rate Limiting
REDIS_URL=redis://redis:6379

Build and Scale Containers
3: Spin up the container cluster with NGINX load balancing traffic across multiple instances:

docker-compose --env-file .env.local up --build --scale app=2 -d
Access the application via NGINX on port 80 at http://localhost.

4: Stop the Container Cluster
docker-compose down

💻 Option B: Running Locally (Node.js)
1: Clone and Install Dependencies

git clone <YOUR_REPOSITORY_URL>
cd documind
npm install

2: Configure .env.local (same environment variables as shown above, with REDIS_URL=redis://localhost:6379)

3: Start Redis Service

docker compose up -d redis

4: Start Development Server

npm run dev
Open http://localhost:3000 in your browser.

📌 System Architecture
sequenceDiagram
    autonumber
    actor User
    participant NGINX as NGINX Load Balancer
    participant App as Next.js Replicas (Docker)
    participant Redis as Redis Rate Limiter
    participant DB as Neon PostgreSQL
    participant Pinecone as Pinecone Vector DB
    participant Cohere as Cohere Rerank
    participant Gemini as Google Gemini AI

    User->>NGINX: HTTP Request (Port 80)
    NGINX->>App: Proxies request (Round-Robin)
    App->>Redis: Check API Rate Limits
    App->>DB: Validate User & Document Ownership
    App->>Pinecone: Semantic Vector Retrieval (Top-K)
    Pinecone-->>App: Return Candidate Chunks
    App->>Cohere: Rerank Chunks for Relevance
    Cohere-->>App: Return Filtered Context
    App->>Gemini: Generate Grounded Answer
    Gemini-->>App: Return LLM Response
    App-->>NGINX: HTTP Response
    NGINX-->>User: Deliver UI Output

1: Ingestion Pipeline: Uploaded PDFs undergo validation, SHA-256 duplicate checking, text extraction, chunking, Gemini embedding generation (gemini-embedding-001), and Pinecone vector indexing.

2: Retrieval Pipeline: User queries pass through conversation-aware rewriting, Pinecone vector search with user-specific metadata filters, and Cohere reranking before arriving at the Gemini LLM for precise context-grounded response generation.

🔌 API Overview
Method,Endpoint,Purpose
GET,/api/documents,Fetch authenticated user's documents
POST,/api/documents,Upload and process a new PDF document
DELETE,/api/documents/[documentId],Delete a user-owned document & associated vectors
POST,/api/chat,Execute RAG pipeline and generate conversational answer
GET,/api/dashboard,Fetch aggregate user library statistics

🔮 Roadmap & Future Enhancements[ ] Streaming Responses: Real-time token streaming for AI chat responses.[ ] Hybrid Search: Combining keyword search (BM25) with vector similarity.[ ] Background Processing Queues: Robust asynchronous PDF ingestion handling.[ ] Persistent Object Storage: Direct cloud object storage integration for raw PDF files.[ ] Automated CI/CD: GitHub Actions pipelines for automated testing and container publishing.

🤝 Contributing
Contributions are welcome! Please feel free to open an issue or submit a pull request.

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request
