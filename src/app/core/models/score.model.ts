import { type UserRef } from './user.model';

export const SEGMENTS = ['en_riesgo', 'activo', 'destacado', 'sin_actividad'] as const;
export type Segment = (typeof SEGMENTS)[number];

export interface ScoreMetrics {
  readonly enrolledCourses: number;
  readonly completedCourses?: number;
  readonly avgProgress?: number;
  readonly daysInactive?: number;
}

export interface UserScore {
  readonly id: number;
  readonly userId: number;
  readonly score: number;
  readonly segment: Segment;
  readonly reasons: readonly string[];
  readonly metrics: ScoreMetrics;
  readonly computedAt: string;
  readonly user: UserRef;
}

export interface SegmentSummary {
  readonly segment: Segment;
  readonly count: number;
  readonly avgScore: number;
}

export interface ScoringRun {
  readonly students: number;
  readonly summary: Partial<Record<Segment, number>>;
  readonly computedAt: string;
}
