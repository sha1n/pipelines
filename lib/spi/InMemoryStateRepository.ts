import { HandlerContext } from '../..';
import { StateRepository } from '../types';
import { info } from '../logger';

interface Identifiable {
  id: string;
}

class InMemoryStateRepository<T extends Identifiable, C extends HandlerContext> implements StateRepository<T, C> {
  private readonly tasks = new Map<string, T>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(task: T, ctx: C): Promise<T> {
    info('Updating %s', task.id);
    this.tasks.set(task.id, task);

    return task;
  }

  get(id: string): T {
    return this.tasks.get(id);
  }
}

export { InMemoryStateRepository };
