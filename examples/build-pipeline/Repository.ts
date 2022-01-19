import { StateRepository } from '../../lib/types';
import { BuildContext, BuildTask } from './model';

class Repository implements StateRepository<BuildTask, BuildContext> {
  private readonly tasks = new Map<string, BuildTask>();

  async update(task: BuildTask, ctx: BuildContext): Promise<BuildTask> {
    ctx.logger.info('Updating build task...');
    task.dateUpdated = new Date();

    this.tasks.set(task.id, task);

    return task;
  }
}

export { Repository };
