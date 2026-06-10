'use client';

import React, { useState } from "react";
import styles from "./SkillTreeVisualizer.module.css";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { useAuth } from "@/context/AuthContext";
import { CheckSquare, Square, Flame, Target } from "lucide-react";
import { motion } from "framer-motion";

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
    {
      id: '1',
      label: 'HTML/CSS',
      x: 50,
      y: 10,
      desc: 'Building blocks of the web.',
      connections: ['2', '3'],
    },
    {
      id: '2',
      label: 'JavaScript',
      x: 30,
      y: 35,
      desc: 'Adding logic and interactivity.',
      connections: ['4'],
    },
    {
      id: '3',
      label: 'Version Ctrl',
      x: 70,
      y: 35,
      desc: 'Git and GitHub for collaboration.',
      connections: ['4'],
    },
    {
      id: '4',
      label: 'React',
      x: 50,
      y: 65,
      desc: 'Component based UI library.',
      connections: ['5'],
    },
    {
      id: '5',
      label: 'Next.js',
      x: 50,
      y: 90,
      desc: 'React framework for production.',
      connections: [],
    },
  ],
  Backend: [
    {
      id: '1',
      label: 'Databases',
      x: 50,
      y: 10,
      desc: 'SQL vs NoSQL architectures.',
      connections: ['2'],
    },
    {
      id: '2',
      label: 'Node.js',
      x: 50,
      y: 40,
      desc: 'JavaScript runtime environment.',
      connections: ['3'],
    },
    {
      id: '3',
      label: 'APIs',
      x: 50,
      y: 70,
      desc: 'REST and GraphQL endpoint creation.',
      connections: [],
    },
  ],
};

export default function SkillTreeVisualizer() {
  const { user } = useAuth();
  const { completedNodes, loading, toggleNode, isNodeCompleted } = useLearningProgress();
  const [activePath, setActivePath] = useState<"Frontend" | "Backend">("Frontend");
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  const nodes = pathsData[activePath];

  // Dynamic progress calculation
  const completedCount = nodes.filter(node => isNodeCompleted(activePath, node.id)).length;
  const progressPercent = nodes.length > 0 ? Math.round((completedCount / nodes.length) * 100) : 0;

  return (
    <div className={`${styles.container} w-full flex flex-col items-center bg-[#0f1115] p-6 rounded-xl border border-slate-800`}>
      
      {/* Dynamic Progress Bar Panel */}
      <div className="w-full max-w-[800px] mb-8 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame className="text-orange-500 animate-pulse animate-duration-1000" size={20} />
              {activePath} Roadmap Progress
            </h3>
            <p className="text-xs text-slate-400">
              {user 
                ? "Your learning progress is synced automatically to your account in real-time." 
                : "Sign in to save and sync your learning progress."
              }
            </p>
          </div>
          <div className="text-left sm:text-right flex flex-col sm:items-end gap-1">
            <span className="text-sm font-semibold text-green-400 font-mono">
              Progress: {progressPercent}% Completed
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {completedCount} of {nodes.length} nodes mastered
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="mt-4 h-2.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Path Selector Controls */}
      <div className={styles.controls}>
        <button
          aria-label="Action button"
          className={`${styles.pathBtn} ${activePath === 'Frontend' ? styles.active : ''}`}
          onClick={() => setActivePath('Frontend')}
        >
          Frontend Path
        </button>
        <button
          aria-label="Action button"
          className={`${styles.pathBtn} ${activePath === 'Backend' ? styles.active : ''}`}
          onClick={() => setActivePath('Backend')}
        >
          Backend Path
        </button>
      </div>

      {/* Roadmap Visualization Tree Area */}
      <div className={styles.treeArea}>
        {/* SVG Lines connecting nodes */}
        <svg className={styles.svgLines}>
          {nodes.map((node) =>
            node.connections.map((targetId) => {
              const targetNode = nodes.find((n) => n.id === targetId);
              if (!targetNode) return null;
              
              const isSourceCompleted = isNodeCompleted(activePath, node.id);
              const isTargetCompleted = isNodeCompleted(activePath, targetId);
              const isActiveLine = isSourceCompleted && isTargetCompleted;

              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${targetNode.x}%`}
                  y2={`${targetNode.y}%`}
                  className={`${styles.line} ${selectedNode?.id === node.id || selectedNode?.id === targetId ? styles.active : ''}`}
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`${styles.node} ${selectedNode?.id === node.id ? styles.completed : ''}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => setSelectedNode(node)}
          >
            {node.label}
          </div>
        ))}
        {nodes.map(node => {
          const isCompleted = isNodeCompleted(activePath, node.id);
          const isSelected = selectedNode?.id === node.id;

          return (
            <div
              key={node.id}
              className={`${styles.node} transition-all duration-300`}
              style={{ 
                left: `${node.x}%`, 
                top: `${node.y}%`,
                borderColor: isSelected ? "#58a6ff" : (isCompleted ? "#2ea043" : "#30363d"),
                color: isCompleted ? "#2ea043" : "#c9d1d9",
                boxShadow: isSelected ? "0 0 20px rgba(88, 166, 255, 0.4)" : (isCompleted ? "0 0 10px rgba(46, 160, 67, 0.15)" : undefined)
              }}
              onClick={() => setSelectedNode(node)}
            >
              <div className="flex flex-col items-center justify-center w-full h-full p-1 select-none">
                {user && (
                  <button
                    aria-label="Toggle node complete status"
                    className="mb-1 hover:scale-110 active:scale-95 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(activePath, node.id);
                    }}
                  >
                    {isCompleted ? (
                      <CheckSquare size={15} className="text-emerald-500" />
                    ) : (
                      <Square size={15} className="text-slate-500" />
                    )}
                  </button>
                )}
                <span className="text-[9px] leading-tight font-semibold text-center tracking-wide">{node.label}</span>
              </div>
            </div>
          );
        })}

        {/* Side Drawer */}
        <div className={`${styles.drawer} ${selectedNode ? styles.open : ''}`}>
          {selectedNode && (
            <>
              <button
                aria-label="Action button"
                className={styles.closeBtn}
                onClick={() => setSelectedNode(null)}
              >
                ✖
              </button>
              <h2 className={styles.drawerTitle}>{selectedNode.label}</h2>
              <p className={styles.drawerDesc}>{selectedNode.desc}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
