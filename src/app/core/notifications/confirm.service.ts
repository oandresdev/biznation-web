import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly tone?: 'danger' | 'default';
}

interface PendingConfirm extends ConfirmRequest {
  readonly resolve: (accepted: boolean) => void;
}

/** Confirmaciones como Promise<boolean>; las muestra un único ConfirmHost con <dialog> nativo. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly pendingRequest = signal<PendingConfirm | null>(null);
  readonly pending = this.pendingRequest.asReadonly();

  ask(request: ConfirmRequest): Promise<boolean> {
    this.pendingRequest()?.resolve(false);
    return new Promise((resolve) => this.pendingRequest.set({ ...request, resolve }));
  }

  settle(accepted: boolean): void {
    this.pendingRequest()?.resolve(accepted);
    this.pendingRequest.set(null);
  }
}
