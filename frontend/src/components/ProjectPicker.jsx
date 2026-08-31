import { useState, useRef } from "react";
import api from "../services/api";

function ProjectPicker({ onScanComplete, onFileWatchTriggered }) {
    const [projectPath, setProjectPath] = useState("/backend/app/src/main/java");
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    async function handleScan() {
        setLoading(true);
        setStatusMsg("Scanning Java project & parsing AST...");
        try {
            const res = await api.post("/projects/scan", { path: projectPath });
            setStatusMsg(`Successfully discovered ${res.data.nodes?.length || 0} Java classes.`);
            if (onScanComplete) {
                onScanComplete(res.data);
            }
        } catch (err) {
            console.error(err);
            setStatusMsg("Failed to scan project: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    }

    async function processUploadedFiles(rawFiles) {
        if (!rawFiles || rawFiles.length === 0) return;
        setLoading(true);
        setStatusMsg(`Reading ${rawFiles.length} uploaded file(s)...`);

        try {
            const filePromises = Array.from(rawFiles).map((file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const relativePath = file.webkitRelativePath || file.name;
                        resolve({
                            name: relativePath,
                            content: e.target.result
                        });
                    };
                    reader.onerror = (err) => reject(err);
                    reader.readAsText(file);
                });
            });

            const parsedFiles = await Promise.all(filePromises);
            const javaFiles = parsedFiles.filter(f => f.name.endsWith(".java"));

            if (javaFiles.length === 0) {
                setStatusMsg("No .java files found in uploaded selection.");
                setLoading(false);
                return;
            }

            setStatusMsg(`Uploading and analyzing AST for ${javaFiles.length} Java class(es)...`);
            const res = await api.post("/projects/upload", {
                files: javaFiles,
                folderName: "custom-uploaded-project"
            });

            setStatusMsg(`Successfully uploaded & mapped ${res.data.nodes?.length || 0} classes!`);
            if (res.data.uploadPath) {
                setProjectPath(res.data.uploadPath);
            }
            if (onScanComplete) {
                onScanComplete(res.data);
            }
        } catch (err) {
            console.error(err);
            setStatusMsg("Failed to upload project: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    }

    function handleFileSelect(e) {
        if (e.target.files) {
            processUploadedFiles(e.target.files);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            processUploadedFiles(e.dataTransfer.files);
        }
    }

    async function handleCheckChanges() {
        try {
            const res = await api.get("/projects/changes");
            const changed = res.data || [];
            if (changed.length > 0) {
                setStatusMsg(`Detected changes in: ${changed.join(", ")}`);
                if (onFileWatchTriggered) onFileWatchTriggered(changed);
            } else {
                setStatusMsg("No file changes detected by FileWatcher.");
            }
        } catch (err) {
            setStatusMsg("Error checking file watch status.");
        }
    }

    return (
        <div className="card project-picker-card">
            <h3 className="section-title">
                <span className="icon">📁</span> Real Java Project Discovery
            </h3>
            <p className="description-text">
                Scan local or uploaded Java source files automatically using AST parsing. Extract imports, types, methods, and dependencies.
            </p>

            <div
                className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: isDragging ? "2px dashed #3b82f6" : "2px dashed #cbd5e1",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isDragging ? "rgba(59, 130, 246, 0.05)" : "#f8fafc",
                    marginBottom: "12px",
                    transition: "all 0.2s ease"
                }}
            >
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 500, color: "#475569" }}>
                    📤 <strong>Click or Drag & Drop Java folder / files here</strong>
                </p>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Select .java files or a folder from your computer to analyze automatically
                </span>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    webkitdirectory=""
                    style={{ display: "none" }}
                />
            </div>

            <div className="input-group">
                <input
                    type="text"
                    className="input-field"
                    placeholder="Or enter path (e.g. /backend/app/src/main/java)"
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleScan} disabled={loading}>
                    {loading ? "Scanning..." : "Scan AST Path"}
                </button>
            </div>

            <div className="button-row" style={{ marginTop: "10px" }}>
                <button className="btn btn-secondary" onClick={handleCheckChanges}>
                    🔍 Run Watcher Check
                </button>
            </div>
            {statusMsg && <div className="status-badge" style={{ marginTop: "10px" }}>{statusMsg}</div>}
        </div>
    );
}

export default ProjectPicker;
