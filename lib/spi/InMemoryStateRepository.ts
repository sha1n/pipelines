import { HandlerContext } from '../..';
import { StateRepository } from '../../lib/types';

interface Identifiable {
  id: string;
}

class InMemoryStateRepository<T extends Identifiable, C extends HandlerContext> implements StateRepository<T, C> {
  private readonly tasks = new Map<string, T>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(task: T, ctx: C): Promise<T> {
    this.tasks.set(task.id, task);

    return task;
  }

  get(id: string): T {
    return this.tasks.get(id);
  }
}

export { InMemoryStateRepository };
