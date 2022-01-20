[![CI](https://github.com/sha1n/pipelines/actions/workflows/ci.yml/badge.svg)](https://github.com/sha1n/pipelines/actions/workflows/ci.yml)
[![Coverage](https://github.com/sha1n/pipelines/actions/workflows/coverage.yml/badge.svg)](https://github.com/sha1n/pipelines/actions/workflows/coverage.yml)
![GitHub](https://img.shields.io/github/license/sha1n/pipelines)
![npm type definitions](https://img.shields.io/npm/types/@sha1n/pipelines)
![npm](https://img.shields.io/npm/v/@sha1n/pipelines)

# Pipelines
A mini-framework for building state driven pipelines. A pipeline can be a simple chain of responsibilities that run in process, but it really gets interesting when the process is distributed.

- [Pipelines](#pipelines)
  - [What's a Pipeline?](#whats-a-pipeline)
  - [Why use pipelines?](#why-use-pipelines)
  - [Simple build pipeline example](#simple-build-pipeline-example)
  - [Build pipeline demo](#build-pipeline-demo)
  - [Install](#install)

## What's a Pipeline?
A pipeline is an abstract process that goes through several execution steps until it reaches a terminal state. A pipeline is stateful and defines  several abstractions:
1. a `StatefulPipelineEntity` - carries the state of the process represented by the pipeline.
2. a `StateRepository` - used to persist the state of the pipeline after every state transition.
3. a `Handler` or a number of them - a handler is a function that transitions the process from one state to another.
4. a `HandlerContext` - any object that carries contextual volatile information throughout the process.

## Why use pipelines?
Pipelines break complex algorithms into smaller steps that have a lot of flexibility on one hand, but have an identical interface. This has many benefits:

- Smaller consistent pieces are easy to test
- Easy to add/remove/replace steps
- Easy to understand the state graph (see example)
- With consistent contextual information and data in all handlers, it is easier to monitor and create effective logs
- A pipeline can be composed of steps that run local actions and remote actions. A pipeline can be driven by a mixture of HTTP/RPC requests, MQ messages, in process triggers and still look and behave like one consistent flow.

## Simple build pipeline example
See full example code [here](examples/build-pipeline)

```ts
// Building a pipeline for a task
const pipeline = createPipelineBuilder<BuildTask, BuildState, BuildContext>()
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


// Configuring a pipeline driver
const driver = new PipelineDriver(pipeline);

// Using the pipeline driver to run a task
const task = new BuildTask('git@github.com:sha1n/pipelines.git');
const wsBasePath = path.join(os.tmpdir(), 'build-pipelines');
const ctx = <BuildContext>{
  workspaceDir: path.join(wsBasePath, task.id),
  elapsed: stopwatch(),
  logger: createLogger(`build:${task.id}`)
};

driver.push(task, ctx).finally(() => {
  return retryAround(() => execute('rm', ['-rf', wsBasePath]), exponentialBackoffRetryPolicy(2));
});
```

## Build pipeline demo
```bash
yarn install && yarn run demo
```

or using NPM

```bash
npm i && npm run demo
```

## Install 
```bash
yarn install @sha1n/pipelines
```

```bash
npm i @sha1n/pipelines
```