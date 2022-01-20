import { stopwatch, TimeUnit, retryAround, exponentialBackoffRetryPolicy } from '@sha1n/about-time';
import path from 'path';
import os from 'os';
import { createPipelineBuilder } from '../../lib/PipelineBuilder';
import { PipelineDriver } from '../../lib/PipelineDriver';
import { createTransitionResolverBuilder } from '../../lib/spi/StaticTransitionResolverBuilder';
import { createLogger } from '../logger';
import { BuildContext, BuildState, BuildTask } from './model';
import { BuildTasksRepository } from './BuildTasksRepository';
import { execute } from './shell';

async function cleanup(ctx: BuildContext) {
  ctx.logger.info(`🧹 Deleting workspace: ${ctx.workspaceDir}...`);
  await retryAround(() => execute('rm', ['-rf', ctx.workspaceDir]), exponentialBackoffRetryPolicy(2));
  ctx.logger.info('Workspace deleted!');
}

const pipeline = createPipelineBuilder<BuildTask, BuildState, BuildContext>()
  .withStateRepository(new BuildTasksRepository())
  .withOnBeforeHandler(async (task, ctx) => {
    ctx.logger.info(`[elapsed: ${ctx.elapsed(TimeUnit.Seconds)}]: Going to handle state: ${task.state}`);
    return task;
  })
  .withOnAfterHandler(async (e, ctx) => {
    ctx.logger.info(`[elapsed: ${ctx.elapsed(TimeUnit.Seconds)}]: State is now ${task.state}`);
  })
  .withErrorHandler(async (error: Error, task: BuildTask, ctx: BuildContext) => {
    ctx.logger.info(`[elapsed: ${ctx.elapsed(TimeUnit.Seconds)}]: Build failed!`);
    ctx.logger.error(`[elapsed: ${ctx.elapsed(TimeUnit.Seconds)}]: ERROR: ${error}`);

    await cleanup(ctx);

    return task;
  })
  .withTransitionResolver(
    createTransitionResolverBuilder<BuildTask, BuildState, BuildContext>()
      .withTerminalStates(BuildState.Completed, BuildState.Failed, BuildState.Cancelled)
      .withTransition(BuildState.Initiated, BuildState.WorkspaceSetup, {
        async handle(task: BuildTask, ctx: BuildContext): Promise<BuildTask> {
          await execute('mkdir', ['-p', ctx.workspaceDir]);
          await execute('git', ['clone', '--depth=1', task.repositoryUrl, ctx.workspaceDir]);

          return task;
        }
      })
      .withTransition(BuildState.WorkspaceSetup, BuildState.InstallCompleted, {
        async handle(task: BuildTask, ctx: BuildContext): Promise<BuildTask> {
          await execute('yarn', ['install'], ctx.workspaceDir);
          await execute('yarn', ['build'], ctx.workspaceDir);
          return task;
        }
      })
      .withTransition(BuildState.InstallCompleted, BuildState.TestCompleted, {
        async handle(entity: BuildTask, ctx: BuildContext): Promise<BuildTask> {
          await execute('yarn', ['test'], ctx.workspaceDir);
          return entity;
        }
      })
      .withTransition(BuildState.TestCompleted, BuildState.Completed, {
        async handle(entity: BuildTask, ctx: BuildContext): Promise<BuildTask> {
          await execute('echo', ['🥳 🎉 Build pipeline finished successfully!']);
          await cleanup(ctx);
          return entity;
        }
      })
      .build()
  )
  .build();

const driver = new PipelineDriver(pipeline);
const task = new BuildTask('git@github.com:sha1n/pipelines.git');
const wsBasePath = path.join(os.tmpdir(), 'build-pipelines');
const ctx = <BuildContext>{
  workspaceDir: path.join(wsBasePath, task.id),
  elapsed: stopwatch(),
  logger: createLogger(`build:${task.id}`)
};

driver.push(task, ctx).finally(() => {
  execute('rm', ['-rf', wsBasePath]); // just to be clean
});
