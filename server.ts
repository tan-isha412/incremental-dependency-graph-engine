import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// CORE DETERMINISTIC GRAPH ALGORITHMS
// ==========================================

interface Node {
  name: string;
  version: number;
  dirty: boolean;
  status: "READY" | "RUNNING" | "COMPLETED" | "FAILED";
}

class GraphEngine {
  private nodes: Map<string, Node> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map(); // Outgoing A -> B
  private reverseAdjacencyList: Map<string, Set<string>> = new Map(); // Incoming B <- A
  private fileHashes: Map<string, string> = new Map();
  private knowledgeGraphNodes: Map<string, { id: string; type: string; pkg: string }> = new Map();
  private knowledgeGraphRelations: Array<{ src: string; target: string; rel: string }> = [];

  constructor() {
    this.seedSampleGraph();
  }

  public seedSampleGraph() {
    this.nodes.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();
    this.knowledgeGraphNodes.clear();
    this.knowledgeGraphRelations = [];

    // Seed initial Java files
    const initialFiles = ["App.java", "Service.java", "Repo.java", "GraphService.java", "BuildController.java"];
    for (const file of initialFiles) {
      this.addNode(file);
      this.knowledgeGraphNodes.set(file, { id: file, type: "CLASS", pkg: "org.example" });
    }

    this.addDependency("Service.java", "Repo.java");
    this.addDependency("App.java", "Service.java");
    this.addDependency("BuildController.java", "GraphService.java");

    this.addKnowledgeRelation("Service.java", "Repo.java", "USES");
    this.addKnowledgeRelation("App.java", "Service.java", "IMPORTS");
    this.addKnowledgeRelation("BuildController.java", "GraphService.java", "CALLS");
  }

  public addNode(name: string) {
    if (!this.nodes.has(name)) {
      this.nodes.set(name, {
        name,
        version: 1,
        dirty: false,
        status: "READY"
      });
      this.adjacencyList.set(name, new Set());
      this.reverseAdjacencyList.set(name, new Set());
      if (!this.knowledgeGraphNodes.has(name)) {
        this.knowledgeGraphNodes.set(name, { id: name, type: "CLASS", pkg: "org.example" });
      }
    }
  }

  public removeNode(name: string) {
    if (!this.nodes.has(name)) return;
    const deps = this.adjacencyList.get(name) || new Set();
    for (const dep of deps) {
      this.reverseAdjacencyList.get(dep)?.delete(name);
    }
    const revs = this.reverseAdjacencyList.get(name) || new Set();
    for (const rev of revs) {
      this.adjacencyList.get(rev)?.delete(name);
    }
    this.adjacencyList.delete(name);
    this.reverseAdjacencyList.delete(name);
    this.nodes.delete(name);
    this.knowledgeGraphNodes.delete(name);
    this.knowledgeGraphRelations = this.knowledgeGraphRelations.filter(
      r => r.src !== name && r.target !== name
    );
  }

  public addDependency(from: string, to: string) {
    this.addNode(from);
    this.addNode(to);
    this.adjacencyList.get(from)?.add(to);
    this.reverseAdjacencyList.get(to)?.add(from);
  }

  public removeDependency(from: string, to: string) {
    this.adjacencyList.get(from)?.delete(to);
    this.reverseAdjacencyList.get(to)?.delete(from);
  }

  public addKnowledgeRelation(src: string, target: string, rel: string) {
    this.knowledgeGraphRelations.push({ src, target, rel });
  }

  public getAllNodes(): string[] {
    return Array.from(this.nodes.keys());
  }

  public getGraphResponse() {
    const nodes = Array.from(this.nodes.keys()).map(name => ({ id: name, label: name }));
    const edges: Array<{ src: string; target: string }> = [];

    for (const [node, deps] of this.adjacencyList.entries()) {
      for (const dep of deps) {
        edges.push({ src: node, target: dep });
      }
    }

    return { nodes, edges };
  }

  // Affected Node Finder: DFS reverse dependencies
  public findAffectedNodes(startNode: string): string[] {
    if (!this.nodes.has(startNode)) {
      throw new Error("Node not found: " + startNode);
    }

    const affected: string[] = [];
    const visited = new Set<string>();

    const dfs = (current: string) => {
      if (visited.has(current)) return;
      visited.add(current);
      affected.push(current);

      const dependents = this.reverseAdjacencyList.get(current) || new Set();
      for (const dep of dependents) {
        dfs(dep);
      }
    };

    dfs(startNode);
    return affected;
  }

  // Cycle Detector: DFS with recursion stack
  public hasCycle(): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (current: string): boolean => {
      visited.add(current);
      recStack.add(current);

      const deps = this.adjacencyList.get(current) || new Set();
      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (dfs(dep)) return true;
        } else if (recStack.has(dep)) {
          return true;
        }
      }

      recStack.delete(current);
      return false;
    };

    for (const node of this.nodes.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) return true;
      }
    }

    return false;
  }

  // Build Order Resolver: Post-order topological sort
  public getBuildOrder(affectedNodes: string[]): string[] {
    const visited = new Set<string>();
    const stack: string[] = [];
    const allowed = new Set(affectedNodes);

    const dfs = (current: string) => {
      visited.add(current);
      const deps = this.adjacencyList.get(current) || new Set();
      for (const dep of deps) {
        if (allowed.has(dep) && !visited.has(dep)) {
          dfs(dep);
        }
      }
      stack.push(current);
    };

    for (const node of affectedNodes) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return stack.reverse();
  }

  // Incremental Build Execution
  public build(changedNode: string) {
    const startTime = Date.now();

    let targetNode = changedNode;
    if (!this.nodes.has(targetNode)) {
      const allNodes = Array.from(this.nodes.keys());
      const match = allNodes.find(n =>
        n.toLowerCase() === targetNode.toLowerCase() ||
        n.toLowerCase() === `${targetNode.toLowerCase()}.java` ||
        n.toLowerCase().includes(targetNode.toLowerCase())
      );
      if (match) {
        targetNode = match;
      } else {
        this.addNode(targetNode);
      }
    }

    if (this.hasCycle()) {
      throw new Error("Dependency cycle detected!");
    }

    const affected = this.findAffectedNodes(targetNode);
    const buildOrder = this.getBuildOrder(affected);

    const builtNodes: Array<{ name: string; version: number }> = [];

    for (const name of buildOrder) {
      const node = this.nodes.get(name)!;
      node.dirty = true;
      node.status = "RUNNING";
      node.version += 1;
      node.dirty = false;
      node.status = "COMPLETED";
      builtNodes.push({ name: node.name, version: node.version });
    }

    const duration = Date.now() - startTime;
    return {
      success: true,
      btime: duration,
      buildTime: duration,
      builtNodes,
      buildorder: buildOrder.map(name => ({ name, version: this.nodes.get(name)?.version || 1 })),
      msg: `Incremental build completed for ${buildOrder.length} affected node(s).`
    };
  }

  // Scan Real Java AST Files
  public scanJavaProject(targetPath: string): { nodes: number; edges: number } {
    let root = targetPath;
    if (!path.isAbsolute(root)) {
      root = path.join(__dirname, targetPath);
    }

    if (!fs.existsSync(root)) {
      // Try fallback to backend source path if provided path doesn't exist
      const fallback = path.join(__dirname, "backend/app/src/main/java");
      if (fs.existsSync(fallback)) root = fallback;
    }

    if (!fs.existsSync(root)) {
      return { nodes: this.nodes.size, edges: 0 };
    }

    const javaFiles: string[] = [];
    const findJava = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findJava(full);
        } else if (entry.isFile() && entry.name.endsWith(".java")) {
          javaFiles.push(full);
        }
      }
    };

    findJava(root);

    this.nodes.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();
    this.knowledgeGraphNodes.clear();
    this.knowledgeGraphRelations = [];

    const fileMap = new Map<string, { className: string; pkg: string; imports: string[]; content: string }>();
    const shortNames = new Map<string, string>();

    for (const filePath of javaFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const fileName = path.basename(filePath);

      let pkg = "default";
      const pkgMatch = content.match(/package\s+([\w.]+);/);
      if (pkgMatch) pkg = pkgMatch[1];

      let className = fileName.replace(".java", "");
      const classMatch = content.match(/(?:class|interface|enum)\s+([A-Za-z0-9_]+)/);
      if (classMatch) className = classMatch[1];

      const imports: string[] = [];
      const importMatches = content.matchAll(/import\s+([\w.]+);/g);
      for (const match of importMatches) {
        imports.push(match[1]);
      }

      fileMap.set(fileName, { className, pkg, imports, content });
      shortNames.set(className, fileName);

      this.addNode(fileName);
      this.knowledgeGraphNodes.set(fileName, { id: fileName, type: "CLASS", pkg });
    }

    // AST relationship resolution
    for (const [fileName, info] of fileMap.entries()) {
      for (const [otherClass, otherFile] of shortNames.entries()) {
        if (otherFile === fileName) continue;

        // Check imports
        const isImported = info.imports.some(imp => imp.endsWith("." + otherClass));
        // Check usage in content
        const isUsed = info.content.includes(otherClass);

        if (isImported || isUsed) {
          this.addDependency(fileName, otherFile);
          const relType = isImported ? "IMPORTS" : "USES";
          this.addKnowledgeRelation(fileName, otherFile, relType);
        }
      }
    }

    return { nodes: this.nodes.size, edges: this.knowledgeGraphRelations.length };
  }

  public getKnowledgeGraph() {
    return {
      nodes: Array.from(this.knowledgeGraphNodes.values()),
      relations: this.knowledgeGraphRelations
    };
  }
}

const engine = new GraphEngine();

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Support both /api/* and root paths
const apiRouter = express.Router();

apiRouter.get("/graph", (req, res) => {
  res.json(engine.getGraphResponse());
});

apiRouter.post("/graph/node", (req, res) => {
  const { name } = req.body || {};
  if (name) engine.addNode(name);
  res.json({ success: true });
});

apiRouter.delete("/graph/node", (req, res) => {
  const { name } = req.body || {};
  if (name) engine.removeNode(name);
  res.json({ success: true });
});

apiRouter.post("/graph/dependency", (req, res) => {
  const { fr, to, src, target } = req.body || {};
  const fromNode = fr || src;
  const toNode = to || target;
  if (fromNode && toNode) engine.addDependency(fromNode, toNode);
  res.json({ success: true });
});

apiRouter.delete("/graph/dependency", (req, res) => {
  const { fr, to, src, target } = req.body || {};
  const fromNode = fr || src;
  const toNode = to || target;
  if (fromNode && toNode) engine.removeDependency(fromNode, toNode);
  res.json({ success: true });
});

apiRouter.post("/build", (req, res) => {
  const node = req.body?.changedNode || req.body?.name || req.body?.e;
  if (!node) {
    return res.status(400).json({ error: "Node name is required" });
  }
  try {
    const result = engine.build(node);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

apiRouter.post("/build/:node", (req, res) => {
  const node = req.params.node;
  try {
    const result = engine.build(node);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, msg: err.message });
  }
});

apiRouter.post("/projects/scan", (req, res) => {
  const targetPath = req.body?.path || "backend/app/src/main/java";
  const stats = engine.scanJavaProject(targetPath);
  res.json(engine.getGraphResponse());
});

apiRouter.post("/projects/upload", (req, res) => {
  try {
    const { files, folderName } = req.body || {};
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "No Java files provided" });
    }

    const uploadFolder = folderName || "uploaded-project";
    const targetDir = path.join(__dirname, "uploads", uploadFolder);

    // Clean and recreate target upload directory
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    // Save uploaded java files
    for (const f of files) {
      if (f.name && f.content) {
        const filePath = path.join(targetDir, f.name);
        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        fs.writeFileSync(filePath, f.content, "utf-8");
      }
    }

    // Automatically scan the newly saved files
    engine.scanJavaProject(targetDir);
    const graphData = engine.getGraphResponse();
    res.json({
      success: true,
      message: `Uploaded and scanned ${files.length} Java file(s).`,
      uploadPath: targetDir,
      ...graphData
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process upload" });
  }
});

apiRouter.get("/projects/changes", (req, res) => {
  res.json([]);
});

// AI Impact Analysis Endpoint
apiRouter.get("/projects/impact/:file", async (req, res) => {
  const changedFile = req.params.file;
  try {
    const allNodes = new Set(engine.getAllNodes());
    if (!allNodes.has(changedFile)) {
      engine.addNode(changedFile);
    }

    const affected = engine.findAffectedNodes(changedFile);
    const directDependents = affected.filter(n => n !== changedFile);

    const indirectDependents: string[] = [];
    const testFiles: string[] = [];
    const unaffectedFiles: string[] = [];

    for (const node of allNodes) {
      if (!affected.includes(node)) {
        unaffectedFiles.push(node);
      } else if (node !== changedFile) {
        testFiles.push(node.replace(".java", "Test.java"));
      }
    }

    const riskLevel = affected.length > 3 ? "HIGH" : (affected.length > 1 ? "MEDIUM" : "LOW");

    let aiExplanation = `Modifying '${changedFile}' triggers incremental rebuild across ${affected.length} node(s) in topological order. Unaffected ${unaffectedFiles.length} file(s) are skipped cleanly without rebuilding.`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI();
        const prompt = `You are a Senior Systems Static Analysis Engineer.
A developer modified '${changedFile}' in a Java codebase.
Deterministic Graph Analysis results:
- Directly affected: ${directDependents.join(", ") || "None"}
- Total affected nodes: ${affected.join(", ")}
- Unaffected nodes skipped: ${unaffectedFiles.join(", ")}

Explain in 2-3 concise, professional sentences why these files were affected, why skipping ${unaffectedFiles.length} files saves build time, and recommend test verification. Do not invent fake files.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });

        if (response.text) {
          aiExplanation = response.text.trim();
        }
      } catch (err) {
        console.warn("Gemini API call skipped/fallback:", err);
      }
    }

    res.json({
      changedFile,
      directDependents,
      indirectDependents,
      potentialTestsToRerun: testFiles,
      unaffectedFiles,
      riskLevel,
      aiExplanation
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api", apiRouter);
app.use("/", apiRouter);

// Set up Vite dev server or static file serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(__dirname, "frontend")
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "frontend/dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Incremental Build Intelligence Platform running on http://localhost:${PORT}`);
  });
}

setupVite();
