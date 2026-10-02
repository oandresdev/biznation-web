import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { toApiError } from '../../../core/api/api-error';
import { AutomationApi } from '../../../core/data-access/automation.api';
import { CoursesApi } from '../../../core/data-access/courses.api';
import { ToastService } from '../../../core/notifications/toast.service';
import { Badge } from '../../../shared/ui/badge';
import { LoadError } from '../../../shared/ui/load-error';
import { ProgressBar } from '../../../shared/ui/progress-bar';
import { SegmentDistribution } from './segment-distribution';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, SegmentDistribution, ProgressBar, Badge, LoadError],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private readonly automation = inject(AutomationApi);
  private readonly toast = inject(ToastService);

  protected readonly summary = this.automation.summary();
  /** Los cursos con mejor progreso promedio primero: "qué cursos funcionan". */
  protected readonly topCourses = inject(CoursesApi).adminCourses(() => ({
    page: 1,
    limit: 5,
    status: 'published',
    sortBy: 'progress',
    order: 'desc',
  }));

  protected readonly running = signal(false);

  protected async runScoring(): Promise<void> {
    this.running.set(true);
    try {
      const result = await firstValueFrom(this.automation.run());
      this.toast.success(`Clasificación actualizada para ${result.students} estudiantes.`);
      this.summary.reload();
    } catch (error) {
      this.toast.error(toApiError(error).message);
    } finally {
      this.running.set(false);
    }
  }
}
