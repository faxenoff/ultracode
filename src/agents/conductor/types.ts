/**
 * Conductor Orchestrator Types
 *
 * Type definitions for the Conductor orchestrator agent.
 */

import type { ResourceConstraints } from "../../types/agent.js";

export interface ConductorConfig {
  resourceConstraints: ResourceConstraints;
  taskQueueLimit: number;
  loadBalancingStrategy: "round-robin" | "least-loaded" | "priority";
  complexityThreshold: number;
  mandatoryDelegation: boolean;
  maxConcurrency: number;
  memoryLimit: number;
  priority: number;
}

export interface TaskComplexityAnalysis {
  score: number; // 1-10 scale
  factors: string[];
  requiresApproval: boolean;
  delegationStrategy: "dev-agent" | "dora" | "multi-agent";
  subtasks: SubTask[];
}

export interface SubTask {
  id: string;
  description: string;
  targetAgent: "dev-agent" | "dora";
  dependencies: string[];
  priority: number;
  payload?: { type?: string; [key: string]: unknown };
}

export interface MethodProposal {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  timeline: string;
  riskLevel: "low" | "medium" | "high" | "very-high";
  recommended: boolean;
}

export type ConductorConfigOverrides = Partial<Omit<ConductorConfig, "resourceConstraints">> & {
  resourceConstraints?: Partial<ResourceConstraints> | undefined;
};
