import { useState, useRef } from "react";
import { FolderGit2, Upload, FileCode, Search, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../services/api";

function ProjectPicker({ onScanComplete, onFileWatchTriggered }) {
    const [projectPath, setProjectPath] = useState("backend/app/src/main/java");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    async function handleScan() {
        setLoading(true);
        setStatus({ type: "info", text: "Scanning path & parsing AST..." });
        try {
            const res = await api.post("/projects/scan", { path: projectPath });
            setStatus({
                type: "success",
                text: `Discovered ${res.data.nodes?.length || 0} Java classes.`
            });
            if (onScanComplete) {
                onScanComplete(res.data);
            }
        } catch (err) {
            console.error(err);
            setStatus({
                type: "error",
                text: "Scan error: " + (err.response?.data?.msg || err.message)
            });
        } finally {
            setLoading(false);
        }
    }

    async function processUploadedFiles(rawFiles) {
        if (!rawFiles || rawFiles.length === 0) return;
        setLoading(true);
        setStatus({ type: "info", text: `Reading ${rawFiles.length} file(s)...` });

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
                setStatus({ type: "error", text: "No .java source files found in selection." });
                setLoading(false);
                return;
            }

            setStatus({ type: "info", text: `Ingesting AST for ${javaFiles.length} classes...` });
            const res = await api.post("/projects/upload", {
                files: javaFiles,
                folderName: "custom-uploaded-project"
            });

            setStatus({
                type: "success",
                text: `Loaded ${res.data.nodes?.length || 0} classes into graph.`
            });
            if (res.data.uploadPath) {
                setProjectPath(res.data.uploadPath);
            }
            if (onScanComplete) {
                onScanComplete(res.data);
            }
        } catch (err) {
            console.error(err);
            setStatus({
                type: "error",
                text: "Upload error: " + (err.response?.data?.error || err.message)
            });
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
                setStatus({ type: "info", text: `Modified: ${changed.join(", ")}` });
                if (onFileWatchTriggered) onFileWatchTriggered(changed);
            } else {
                setStatus({ type: "info", text: "No pending file changes detected." });
            }
        } catch {
            setStatus({ type: "error", text: "Watch check failed." });
        }
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <FolderGit2 size={15} />
                    <span>Project Discovery</span>
                </h3>
            </div>

            <p className="card-description">
                Extract class dependencies, package imports, and inheritance trees via static AST analysis.
            </p>

            <div
                className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload size={16} className="text-secondary" />
                <div className="dropzone-title">
                    <span>Upload Java files or folder</span>
                </div>
                <div className="dropzone-subtitle">
                    Drop .java files here or click to browse
                </div>
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
                    placeholder="Filesystem path (/src/main/java)"
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleScan} disabled={loading}>
                    <FileCode size={13} />
                    <span>{loading ? "Scanning" : "Scan Path"}</span>
                </button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-sm btn-secondary" onClick={handleCheckChanges}>
                    <Search size={12} />
                    <span>Check File Changes</span>
                </button>
            </div>

            {status && (
                <div className={`status-badge ${status.type}`}>
                    {status.type === "success" ? (
                        <CheckCircle2 size={13} />
                    ) : status.type === "error" ? (
                        <AlertCircle size={13} />
                    ) : (
                        <FileCode size={13} />
                    )}
                    <span>{status.text}</span>
                </div>
            )}
        </div>
    );
}

export default ProjectPicker;
