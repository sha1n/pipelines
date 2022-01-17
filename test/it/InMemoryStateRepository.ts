import { StateRepository } from '../../lib/types';
import { Task, TaskContext } from './model';

class InMemoryStateRepository implements StateRepository<Task, TaskContext> {
  private readonly tasks = new Map<string, Task>();

  async update(entity: Task, ctx: TaskContext): Promise<Task> {
    ctx.logger.info('Updating task state...');

    this.tasks.set(entity.id, entity);

    return entity;
  }
}

export { InMemoryStateRepository };
