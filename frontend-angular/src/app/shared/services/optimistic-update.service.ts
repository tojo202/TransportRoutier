import { Injectable, signal, computed, effect, Inject, InjectionToken } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface OptimisticAction<T> {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  optimisticData: T;
  previousData?: T;
  rollbackData?: T;
  timestamp: number;
}

export interface OptimisticState<T> {
  data: T[];
  pendingActions: OptimisticAction<T>[];
  isRollingBack: boolean;
}

export const ENTITY_NAME = new InjectionToken<string>('ENTITY_NAME');

@Injectable({
  providedIn: 'root'
})
export class OptimisticUpdateService {
  private state = signal<Record<string, OptimisticState<any>> >({});
  
  getState<T>(entity: string): OptimisticState<T> {
    return this.state()[entity] || { data: [], pendingActions: [], isRollingBack: false };
  }

  getData<T>(entity: string): T[] {
    return this.getState<T>(entity).data;
  }

  getPendingActions<T>(entity: string): OptimisticAction<T>[] {
    return this.getState<T>(entity).pendingActions;
  }

  isRollingBack(entity: string): boolean {
    return this.getState(entity).isRollingBack;
  }

  hasPendingActions(entity: string): boolean {
    return this.getPendingActions(entity).length > 0;
  }

  setData<T>(entity: string, data: T[]): void {
    this.state.update(current => ({
      ...current,
      [entity]: {
        ...this.getState(entity),
        data: [...data]
      }
    }));
  }

  optimisticCreate<T extends { id?: string | number }, TWithId extends { id: string | number } = T & { id: string | number }>(
    entity: string,
    optimisticItem: T,
    apiCall: () => Observable<TWithId>,
    options?: {
      idGenerator?: () => string | number;
      onSuccess?: (serverItem: TWithId) => void;
      onError?: (error: Error, rolledBackItem: TWithId) => void;
    }
  ): Observable<TWithId> {
    const tempId = options?.idGenerator ? options.idGenerator() : `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const itemWithTempId = { ...optimisticItem, id: tempId } as unknown as TWithId;
    
    const action: OptimisticAction<TWithId> = {
      id: `create_${tempId}`,
      type: 'create',
      entity,
      optimisticData: itemWithTempId,
      timestamp: Date.now()
    };

    this.addPendingAction(entity, action);
    this.addToData(entity, itemWithTempId);

    return apiCall().pipe(
      tap((serverItem: TWithId) => {
        this.replaceOptimisticItem(entity, tempId, serverItem);
        this.removePendingAction(entity, action.id);
        options?.onSuccess?.(serverItem);
      }),
      catchError((error) => {
        this.rollbackCreate(entity, tempId);
        options?.onError?.(error, itemWithTempId);
        return throwError(() => error);
      })
    );
  }

  optimisticUpdate<T extends { id: string | number }>(
    entity: string,
    itemId: string | number,
    updates: Partial<T>,
    apiCall: () => Observable<T>,
    options?: {
      onSuccess?: (serverItem: T) => void;
      onError?: (error: Error, originalItem: T) => void;
    }
  ): Observable<T> {
    const currentData = this.getData<T>(entity);
    const originalItem = currentData.find(item => item.id === itemId);
    
    if (!originalItem) {
      return throwError(() => new Error(`Item with id ${itemId} not found`));
    }

    const optimisticItem = { ...originalItem, ...updates } as T;
    
    const action: OptimisticAction<T> = {
      id: `update_${itemId}_${Date.now()}`,
      type: 'update',
      entity,
      optimisticData: optimisticItem,
      previousData: { ...originalItem },
      timestamp: Date.now()
    };

    this.addPendingAction(entity, action);
    this.updateInData(entity, itemId, optimisticItem);

    return apiCall().pipe(
      tap((serverItem: T) => {
        this.updateInData(entity, itemId, serverItem);
        this.removePendingAction(entity, action.id);
        options?.onSuccess?.(serverItem);
      }),
      catchError((error) => {
        this.rollbackUpdate(entity, itemId, originalItem);
        options?.onError?.(error, originalItem);
        return throwError(() => error);
      })
    );
  }

  optimisticDelete<T extends { id: string | number }>(
    entity: string,
    itemId: string | number,
    apiCall: () => Observable<void>,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error, deletedItem: T) => void;
    }
  ): Observable<void> {
    const currentData = this.getData<T>(entity);
    const deletedItem = currentData.find(item => item.id === itemId);
    
    if (!deletedItem) {
      return throwError(() => new Error(`Item with id ${itemId} not found`));
    }

    const action: OptimisticAction<T> = {
      id: `delete_${itemId}_${Date.now()}`,
      type: 'delete',
      entity,
      optimisticData: deletedItem,
      previousData: { ...deletedItem },
      timestamp: Date.now()
    };

    this.addPendingAction(entity, action);
    this.removeFromData(entity, itemId);

    return apiCall().pipe(
      tap(() => {
        this.removePendingAction(entity, action.id);
        options?.onSuccess?.();
      }),
      catchError((error) => {
        this.rollbackDelete(entity, deletedItem);
        options?.onError?.(error, deletedItem);
        return throwError(() => error);
      })
    );
  }

  rollbackAll(entity: string): void {
    const state = this.getState(entity);
    state.pendingActions.forEach(action => {
      switch (action.type) {
        case 'create':
          this.rollbackCreate(entity, (action.optimisticData as any).id);
          break;
        case 'update':
          if (action.previousData) {
            this.rollbackUpdate(entity, (action.previousData as any).id, action.previousData);
          }
          break;
        case 'delete':
          if (action.previousData) {
            this.rollbackDelete(entity, action.previousData);
          }
          break;
      }
    });
  }

  private addPendingAction<T>(entity: string, action: OptimisticAction<T>): void {
    this.state.update(current => ({
      ...current,
      [entity]: {
        ...this.getState(entity),
        pendingActions: [...this.getPendingActions(entity), action]
      }
    }));
  }

  private removePendingAction(entity: string, actionId: string): void {
    this.state.update(current => ({
      ...current,
      [entity]: {
        ...this.getState(entity),
        pendingActions: this.getPendingActions(entity).filter(a => a.id !== actionId)
      }
    }));
  }

  private addToData<T>(entity: string, item: T): void {
    this.state.update(current => ({
      ...current,
      [entity]: {
        ...this.getState(entity),
        data: [...this.getData<T>(entity), item]
      }
    }));
  }

  private updateInData<T extends { id: string | number }>(entity: string, itemId: string | number, updatedItem: T): void {
    this.state.update(current => ({
      ...current,
      [entity]: {
        ...this.getState(entity),
        data: this.getData<T>(entity).map(item => 
          item.id === itemId ? updatedItem : item
        )
      }
    }));
  }

  private removeFromData<T extends { id: string | number }>(entity: string, itemId: string | number): void {
    this.state.update(current => ({
      ...current,
      [entity]: {
        ...this.getState(entity),
        data: this.getData<T>(entity).filter(item => item.id !== itemId)
      }
    }));
  }

  private replaceOptimisticItem<T extends { id: string | number }>(entity: string, tempId: string | number, serverItem: T): void {
    this.state.update(current => ({
      ...current,
      [entity]: {
        ...this.getState(entity),
        data: this.getData<T>(entity).map(item => 
          item.id === tempId ? serverItem : item
        )
      }
    }));
  }

  private rollbackCreate(entity: string, tempId: string | number): void {
    this.removeFromData(entity, tempId);
    this.getState(entity).pendingActions = this.getPendingActions(entity).filter(a => a.id !== `create_${tempId}`);
  }

  private rollbackUpdate(entity: string, itemId: string | number, originalItem: any): void {
    this.updateInData(entity, itemId, originalItem);
    this.getState(entity).pendingActions = this.getPendingActions(entity).filter(
      a => !(a.type === 'update' && (a.optimisticData as any).id === itemId)
    );
  }

  private rollbackDelete(entity: string, deletedItem: any): void {
    this.addToData(entity, deletedItem);
    this.getState(entity).pendingActions = this.getPendingActions(entity).filter(
      a => !(a.type === 'delete' && (a.optimisticData as any).id === (deletedItem as any).id)
    );
  }

  clearEntity(entity: string): void {
    this.state.update(current => {
      const newState = { ...current };
      delete newState[entity];
      return newState;
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class OptimisticListService<T extends { id: string | number }> {
  constructor(
    private optimisticService: OptimisticUpdateService,
    @Inject(ENTITY_NAME) private entityName: string
  ) {}

  items = computed(() => this.optimisticService.getData<T>(this.entityName));
  pendingActions = computed(() => this.optimisticService.getPendingActions<T>(this.entityName));
  isRollingBack = computed(() => this.optimisticService.isRollingBack(this.entityName));
  hasPending = computed(() => this.optimisticService.hasPendingActions(this.entityName));

  setItems(items: T[]): void {
    this.optimisticService.setData(this.entityName, items);
  }

  create(optimisticItem: T, apiCall: () => Observable<T>, options?: Parameters<OptimisticUpdateService['optimisticCreate']>[3]): Observable<T> {
    return this.optimisticService.optimisticCreate(this.entityName, optimisticItem, apiCall, options);
  }

  update(itemId: string | number, updates: Partial<T>, apiCall: () => Observable<T>, options?: Parameters<OptimisticUpdateService['optimisticUpdate']>[4]): Observable<T> {
    return this.optimisticService.optimisticUpdate(this.entityName, itemId, updates, apiCall, options);
  }

  delete(itemId: string | number, apiCall: () => Observable<void>, options?: Parameters<OptimisticUpdateService['optimisticDelete']>[3]): Observable<void> {
    return this.optimisticService.optimisticDelete(this.entityName, itemId, apiCall, options);
  }

  rollbackAll(): void {
    this.optimisticService.rollbackAll(this.entityName);
  }
}