import { v4 as uuid } from 'uuid';
import { StatefulPipelineEntity } from '../../lib/spi';
import { Logger } from './logger';

enum TaskState {
  Submitted,
  Started,
  Completed,
  Failed,
  Cancelled
}

class Task implements StatefulPipelineEntity<TaskState> {
  readonly id: string = uuid();
  state: TaskState = TaskState.Submitted;

  setFailedState(): void {
    this.state = TaskState.Failed;
  }
}

class TaskContext {
  execCount = 0;
  startTime?: number;
  elapsedTime?: number;

  constructor(readonly logger: Logger) {}
}

export { Task, TaskState, TaskContext };
