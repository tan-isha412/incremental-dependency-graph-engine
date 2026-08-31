# Incremental Build Intelligence Engine

An AST-driven incremental dependency analysis and build optimization platform. It parses Java projects into an in-memory Directed Acyclic Graph (DAG), calculates minimal topological recompilation orders, detects cycles, and assesses blast-radius impact when source files change.

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
├── server.ts               # Express API server & TypeScript AST/DAG engine
├── app/                    # Optional Java Gradle module (Spring Boot / JavaParser)
├── backend/                # Gradle wrapper & build scripts
├── package.json            # Root scripts & unified dependencies
└── .env.example            # Environment configuration template
```

---

## Getting Started (Local Setup)

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm** or **bun**
- *(Optional)* **JDK 17+** and Gradle if running the standalone Java backend

---

### Step 1: Install Dependencies

Install root and frontend dependencies:

```bash
# Install root backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### Step 2: Configure Environment (Optional)

Copy the environment template:

```bash
cp .env.example .env
```

If you wish to enable AI-assisted impact reasoning, add your Gemini API key to `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

*(Note: The core AST parser, DAG engine, incremental builder, and test recommender work completely offline without an API key).*

---

### Step 3: Run the Development Server

Start the full-stack application (Express API + Vite React frontend):

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

### Step 4: Build for Production

To create an optimized production build:

```bash
npm run build
npm start
```

---

## Standalone Java Backend (Optional)

If you prefer running the native Java Spring Boot service alongside the client:

```bash
cd backend/app

# On Linux / macOS
./gradlew bootRun

# On Windows
gradlew.bat bootRun
```

The Spring Boot backend will start on `http://localhost:8080`.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/graph` | Fetch all nodes, edges, and graph metadata |
| `POST` | `/api/graph/node` | Add a new node to the graph (`{ name: string }`) |
| `DELETE` | `/api/graph/node/:name` | Remove a node and its associated dependencies |
| `POST` | `/api/graph/edge` | Add a directed dependency edge (`{ fr: string, to: string }`) |
| `DELETE` | `/api/graph/dependency` | Remove a dependency edge |
| `POST` | `/api/build` | Execute an incremental build for a changed node |
| `POST` | `/api/projects/scan` | Scan local filesystem path for Java files and parse AST |
| `POST` | `/api/projects/upload` | Upload and analyze an array of `.java` source files |
| `GET` | `/api/projects/impact/:file` | Generate blast-radius impact report and recommended tests |
| `GET` | `/api/projects/changes` | Check file watcher for real-time filesystem modifications |
