import { TimeUnit } from '@sha1n/about-time';
import { createPipelineBuilder, createTransitionResolverBuilder, InMemoryStateRepository } from '../..';
import { BuildContext, BuildState, BuildTask } from './model';
import { execute } from './shell';

class BuildTasksRepository extends InMemoryStateRepository<BuildTask, BuildContext> {
  async update(task: BuildTask, ctx: BuildContext): Promise<BuildTask> {
    ctx.logger.info(`[elapsed: ${ctx.elapsed(TimeUnit.Seconds)}]: Updating task: ${task.state}`);
    task.dateUpdated = new Date();

    return super.update(task, ctx);
  }
}

async function cleanup(ctx: BuildContext) {
  ctx.logger.info(`🧹 Deleting workspace: ${ctx.workspaceDir}...`);
  await execute('rm', ['-rf', ctx.workspaceDir]);
  ctx.logger.info('Workspace deleted!');
}

export default createPipelineBuilder<BuildTask, BuildState, BuildContext>()
  .withStateRepository(new BuildTasksRepository())
  .withFailedState(BuildState.Failed)
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
      // eslint-disable-next-line prettier/prettier
      .withTransition(BuildState.Initiated, BuildState.WorkspaceSetup, 
        async (task: BuildTask, ctx: BuildContext) => {
        await execute('mkdir', ['-p', ctx.workspaceDir]);
        await execute('git', ['clone', '--depth=1', task.repositoryUrl, ctx.workspaceDir]);

        return task;
      })
      .withTransition(
        BuildState.WorkspaceSetup,
        BuildState.InstallCompleted,
        async (task: BuildTask, ctx: BuildContext) => {
          await execute('pnpm', ['install'], ctx.workspaceDir);
          await execute('pnpm', ['run', 'build'], ctx.workspaceDir);
          return task;
        }
      )
      .withTransition(
        BuildState.InstallCompleted,
        BuildState.TestCompleted,
        async (task: BuildTask, ctx: BuildContext) => {
          await execute('pnpm', ['test'], ctx.workspaceDir);
          return task;
        }
      )
      .withTransition(BuildState.TestCompleted, BuildState.Completed, async (task: BuildTask, ctx: BuildContext) => {
        await execute('echo', ['🥳 🎉 Build pipeline finished successfully!']);
        await cleanup(ctx);
        return task;
      })
      .build()
  )
  .build();
