# Incremental Build Intelligence Engine

An AST-driven incremental dependency analysis and build optimization platform. It parses Java projects into an in-memory Directed Acyclic Graph (DAG), calculates minimal topological recompilation orders, detects cycles, and assesses blast-radius impact when source files change.

The engine is implemented **twice**, independently:
- **`backend/app/` (Java / Spring Boot + JavaParser)** — the primary, deployed backend. The React frontend talks to this by default, and it's what's deployed on Render (see [Deployment](#deployment)).
- **`server.ts` (TypeScript / Express)** — a parallel implementation of the same engine and REST contract, using a lightweight regex-based Java parser instead of a real AST library. Useful to run standalone (`npm run dev`) or to compare approaches; not used in production.

---

## Features

- **Static AST Parsing & Discovery**: Ingests Java source files directly from local directories or browser drag-and-drop upload, extracting package declarations, type references, imports, and inheritance chains.
- **Deterministic DAG Engine**: In-memory dependency graph tracking downstream dependents, cycle validation (Tarjan's/DFS algorithm), and topological compilation ordering.
- **Incremental Build Trigger**: Recomputes only the affected subgraphs upon file modification, bypassing clean builds and caching unaffected binaries.
- **Blast-Radius Impact Analysis**: Classifies direct vs. indirect dependents, computes risk score, recommends targeted test suites to run, and provides optional AI-assisted reasoning.
- **Interactive Visualizer**: Minimalist ReactFlow canvas showing real-time node connections, dependency flows, and node inspector.
- **Execution Audit Log**: Historical log of build timestamps, duration metrics (ms), and versioned recompilation sequences.

---

## Project Structure

```
├── frontend/               # React + Vite client application
│   ├── src/
│   │   ├── components/     # Canvas, Control Panel, Metrics, History, Impact
│   │   ├── pages/          # Main Dashboard
│   │   └── services/       # Axios API client
│   └── package.json
├── backend/                # Gradle multi-project root (wrapper + settings)
│   └── app/                # Spring Boot service: controllers, DAG engine, JavaParser AST analyzer
│       └── build.gradle    # also bundles frontend/dist as Spring static content when built
├── server.ts               # Alternate Express API server & TypeScript AST/DAG engine (not deployed)
├── Dockerfile               # Multi-stage build: frontend -> Spring Boot jar -> JRE runtime image
├── render.yaml              # Render Blueprint (Docker runtime) for the Spring Boot service
├── package.json            # Root scripts for the TS/Express alternate path
└── .env.example            # Environment configuration template (server.ts only)
```

---

## Getting Started (Local Setup)

### Prerequisites

- **JDK 21** and the bundled Gradle wrapper (primary backend)
- **Node.js** `v18+` and npm (frontend build; also needed for the alternate TS backend)

---

### Step 1: Build the frontend

```bash
cd frontend
npm install
npm run build   # produces frontend/dist, which the Spring Boot build bundles as static content
cd ..
```

---

### Step 2: Run the Spring Boot backend

```bash
cd backend

# On Linux / macOS
./gradlew bootRun

# On Windows
gradlew.bat bootRun
```

This serves both the REST API (under `/api/*`) and the built React app (at `/`) on `http://localhost:8080`.

---

### Alternate: run the TypeScript/Express implementation instead

Not used in production, but runnable standalone for comparison:

```bash
npm install
cp .env.example .env   # optional: add GEMINI_API_KEY for AI-assisted impact reasoning
npm run dev             # http://localhost:3000
```

*(Only `server.ts` calls Gemini; the Spring Boot backend's impact analysis is fully rule-based and needs no API key.)*

---

## Deployment

The project deploys as a single Docker image (`Dockerfile` at the repo root): it builds the frontend, builds the Spring Boot jar with the frontend bundled in as static resources, then packages a minimal JRE runtime image. `render.yaml` configures this as a Render Blueprint (Docker runtime) — see the repo's deployment notes for the exact steps.

---

## API Endpoints Reference

All endpoints are served under `/api` by the Spring Boot backend (`backend/app`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/graph` | Fetch all nodes, edges, and graph metadata |
| `POST` | `/api/graph/node` | Add a new node to the graph (`{ name: string }`) |
| `DELETE` | `/api/graph/node/:name` | Remove a node and its associated dependencies |
| `POST` | `/api/graph/edge` | Add a directed dependency edge (`{ fr: string, to: string }`) |
| `DELETE` | `/api/graph/edge` | Remove a dependency edge (`{ fr: string, to: string }`) |
| `GET` | `/api/graph/cycle` | Check whether the current graph has a circular dependency |
| `POST` | `/api/build` | Execute an incremental build for a changed node |
| `POST` | `/api/projects/scan` | Scan a filesystem path for Java files and parse AST |
| `POST` | `/api/projects/upload` | Upload and analyze an array of `.java` source files |
| `GET` | `/api/projects/impact/:file` | Generate blast-radius impact report and recommended tests |
| `GET` | `/api/projects/changes` | Check file watcher for real-time filesystem modifications |
