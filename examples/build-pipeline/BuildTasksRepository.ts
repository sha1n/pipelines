import { TimeUnit } from '@sha1n/about-time';
import { InMemoryStateRepository } from '../../lib/spi/InMemoryStateRepository';
import { BuildContext, BuildTask } from './model';

class BuildTasksRepository extends InMemoryStateRepository<BuildTask, BuildContext> {
  async update(task: BuildTask, ctx: BuildContext): Promise<BuildTask> {
    ctx.logger.info(`[elapsed: ${ctx.elapsed(TimeUnit.Seconds)}]: Updating task: ${task.state}`);
    task.dateUpdated = new Date();

    return super.update(task, ctx);
  }
}

export { BuildTasksRepository };
