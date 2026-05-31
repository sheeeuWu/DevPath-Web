"use client";

import React, { useState } from "react";
import styles from "./SkillTreeVisualizer.module.css";

type SkillNode = {
  id: string;
  label: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  desc: string;
  connections: string[];
};

const pathsData: Record<string, SkillNode[]> = {
  Frontend: [
    { id: "1", label: "HTML/CSS", x: 50, y: 10, desc: "Building blocks of the web.", connections: ["2", "3"] },
    { id: "2", label: "JavaScript", x: 30, y: 35, desc: "Adding logic and interactivity.", connections: ["4"] },
    { id: "3", label: "Version Ctrl", x: 70, y: 35, desc: "Git and GitHub for collaboration.", connections: ["4"] },
    { id: "4", label: "React", x: 50, y: 65, desc: "Component based UI library.", connections: ["5"] },
    { id: "5", label: "Next.js", x: 50, y: 90, desc: "React framework for production.", connections: [] },
  ],
  Backend: [
    { id: "1", label: "Databases", x: 50, y: 10, desc: "SQL vs NoSQL architectures.", connections: ["2"] },
    { id: "2", label: "Node.js", x: 50, y: 40, desc: "JavaScript runtime environment.", connections: ["3"] },
    { id: "3", label: "APIs", x: 50, y: 70, desc: "REST and GraphQL endpoint creation.", connections: [] },
  ]
};

export default function SkillTreeVisualizer() {
  const [activePath, setActivePath] = useState<"Frontend" | "Backend">("Frontend");
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  const nodes = pathsData[activePath];

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button aria-label="Action button"  
          className={`${styles.pathBtn} ${activePath === "Frontend" ? styles.active : ""}`}
          onClick={() => setActivePath("Frontend")}
        >
          Frontend Path
        </button>
        <button aria-label="Action button"  
          className={`${styles.pathBtn} ${activePath === "Backend" ? styles.active : ""}`}
          onClick={() => setActivePath("Backend")}
        >
          Backend Path
        </button>
      </div>

      <div className={styles.treeArea}>
        {/* SVG Lines connecting nodes */}
        <svg className={styles.svgLines}>
          {nodes.map(node => 
            node.connections.map(targetId => {
              const targetNode = nodes.find(n => n.id === targetId);
              if (!targetNode) return null;
              return (
                <line 
                  key={`${node.id}-${targetId}`}
                  x1={`${node.x}%`} 
                  y1={`${node.y}%`} 
                  x2={`${targetNode.x}%`} 
                  y2={`${targetNode.y}%`} 
                  className={`${styles.line} ${selectedNode?.id === node.id || selectedNode?.id === targetId ? styles.active : ""}`}
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={`${styles.node} ${selectedNode?.id === node.id ? styles.completed : ""}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => setSelectedNode(node)}
          >
            {node.label}
          </div>
        ))}

        {/* Side Drawer */}
        <div className={`${styles.drawer} ${selectedNode ? styles.open : ""}`}>
          {selectedNode && (
            <>
              <button aria-label="Action button"  className={styles.closeBtn} onClick={() => setSelectedNode(null)}>✖</button>
              <h2 className={styles.drawerTitle}>{selectedNode.label}</h2>
              <p className={styles.drawerDesc}>{selectedNode.desc}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}