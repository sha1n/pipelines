import { TimeUnit } from '@sha1n/about-time';
import { createPipelineBuilder } from '../../lib/PipelineBuilder';
import { createTransitionResolverBuilder } from '../../lib/spi/StaticTransitionResolverBuilder';
import { BuildTasksRepository } from './BuildTasksRepository';
import { BuildContext, BuildState, BuildTask } from './model';
import { execute } from './shell';

async function cleanup(ctx: BuildContext) {
  ctx.logger.info(`🧹 Deleting workspace: ${ctx.workspaceDir}...`);
  await execute('rm', ['-rf', ctx.workspaceDir]);
  ctx.logger.info('Workspace deleted!');
}

export default createPipelineBuilder<BuildTask, BuildState, BuildContext>()
  .withStateRepository(new BuildTasksRepository())
  .withOnBeforeHandler(async (task, ctx) => {
    ctx.logger.info(`[elapsed: ${ctx.elapsed(TimeUnit.Seconds)}]: ${task.state}`);
    return task;
  })
  .withOnAfterHandler(async (task, ctx) => {
    ctx.logger.info(`[elapsed: ${ctx.elapsed(TimeUnit.Seconds)}]: State is now ${task.state}`);
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
