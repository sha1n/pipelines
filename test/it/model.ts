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
  execCount = 0;
  startTime?: number;
  elapsedTime?: number;
  state: TaskState = TaskState.Submitted;

  setFailedState(): void {
    this.state = TaskState.Failed;
  }
}

type TaskContext = {
  readonly logger: Logger;
};

export { Task, TaskState, TaskContext };
