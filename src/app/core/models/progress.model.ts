import { type UserRef } from './user.model';
import { type Segment } from './score.model';

export interface Enrollment {
  readonly id: number;
  readonly userId: number;
  readonly courseId: number;
  readonly progressPct: number;
  readonly lastActivityAt: string | null;
  readonly completedAt: string | null;
  readonly createdAt: string;
}

export interface LessonCompletion {
  readonly lessonId: number;
  readonly courseId: number;
  readonly alreadyCompleted: boolean;
  readonly courseProgress: number;
  readonly courseCompleted: boolean;
}

export interface MyCourseProgress {
  readonly courseId: number;
  readonly title: string;
  readonly progressPct: number;
  readonly enrolledAt: string;
  readonly lastActivityAt: string | null;
  readonly completedAt: string | null;
}

export interface MyProgress {
  readonly courses: readonly MyCourseProgress[];
  readonly score: { readonly score: number; readonly segment: Segment; readonly computedAt: string } | null;
}

export type StudentProgressStatus = 'completed' | 'in_progress' | 'not_started';

export interface CourseStudent {
  readonly user: UserRef;
  readonly progressPct: number;
  readonly enrolledAt: string;
  readonly lastActivityAt: string | null;
  readonly completedAt: string | null;
}
