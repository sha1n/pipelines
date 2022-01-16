import { v4 as uuid } from 'uuid';
import { Stateful } from '../../lib/types';
import { Logger } from './logger';

enum TaskState {
  Submitted,
  Started,
  Completed,
  Failed,
  Cancelled
}

class Task implements Stateful<TaskState> {
  readonly id: string = uuid();
  state: TaskState = TaskState.Submitted;

  getState(): TaskState {
    return this.state;
  }
}

class TaskContext {
  execCount = 0;
  startTime?: number;
  elapsedTime?: number;

  constructor(readonly logger: Logger) {}
}

export { Task, TaskState, TaskContext };
