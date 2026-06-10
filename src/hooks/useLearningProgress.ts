"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface UseLearningProgressResult {
  completedNodes: string[];
  loading: boolean;
  toggleNode: (pathId: string, nodeId: string) => Promise<void>;
  isNodeCompleted: (pathId: string, nodeId: string) => boolean;
}

export function useLearningProgress(): UseLearningProgressResult {
  const { user } = useAuth();
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompletedNodes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, 'user_progress', user.uid);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setCompletedNodes(data.completedNodes || []);
        } else {
          setCompletedNodes([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to learning progress:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const toggleNode = async (pathId: string, nodeId: string) => {
    if (!user) return;

    const nodeKey = `${pathId}-${nodeId}`;
    const isCompleted = completedNodes.includes(nodeKey);

    // Optimistic UI Update: Reflect state immediately in local array
    const previousCompletedNodes = [...completedNodes];
    const nextCompletedNodes = isCompleted
      ? completedNodes.filter((id) => id !== nodeKey)
      : [...completedNodes, nodeKey];

    setCompletedNodes(nextCompletedNodes);

    try {
      const docRef = doc(db, 'user_progress', user.uid);
      await setDoc(
        docRef,
        {
          userId: user.uid,
          completedNodes: nextCompletedNodes,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Failed to save learning progress:", error);
      // Revert state on error if background write fails
      setCompletedNodes(previousCompletedNodes);
    }
  };

  const isNodeCompleted = (pathId: string, nodeId: string) => {
    return completedNodes.includes(`${pathId}-${nodeId}`);
  };

  return {
    completedNodes,
    loading,
    toggleNode,
    isNodeCompleted,
  };
}
