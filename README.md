[![CI](https://github.com/sha1n/pipelines/actions/workflows/ci.yml/badge.svg)](https://github.com/sha1n/pipelines/actions/workflows/ci.yml)
[![Coverage](https://github.com/sha1n/pipelines/actions/workflows/coverage.yml/badge.svg)](https://github.com/sha1n/pipelines/actions/workflows/coverage.yml)
![GitHub](https://img.shields.io/github/license/sha1n/pipelines)
![npm type definitions](https://img.shields.io/npm/types/@sha1n/pipelines)
![npm](https://img.shields.io/npm/v/@sha1n/pipelines)

# Pipelines
A mini-framework for building state driven pipelines. A pipeline can be a simple chain of responsibilities that run in process, but it really gets interesting when the process is distributed.

- [Pipelines](#pipelines)
  - [What's a Pipeline?](#whats-a-pipeline)
  - [Why use Pipelines?](#why-use-pipelines)
  - [Use Cases](#use-cases)
    - [In Memory](#in-memory)
    - [Distributed](#distributed)
      - [Example](#example)
  - [Simple Build Pipeline Example](#simple-build-pipeline-example)
  - [Build Pipeline Demo](#build-pipeline-demo)
  - [Install](#install)

## What's a Pipeline?
A pipeline is an abstract process that goes through several execution steps until it reaches a terminal state. A pipeline is stateful and defines  several abstractions:
1. a `StatefulPipelineEntity` - carries the state of the process represented by the pipeline.
2. a `StateRepository` - used to persist the state of the pipeline after every state transition.
3. a `Handler` or a number of them - a handler is a function that transitions the process from one state to another.
4. a `HandlerContext` - any object that carries contextual volatile information throughout the process.

## Why use Pipelines?
Pipelines break complex algorithms into smaller steps that have a lot of flexibility on one hand, but have an identical interface. This has many benefits:

- Smaller consistent pieces are easy to test
- Easy to add/remove/replace steps
- Easy to understand the state graph (see example)
- With consistent contextual information and data in all handlers, it is easier to monitor and create effective logs
- A pipeline can be composed of steps that run local actions and remote actions. A pipeline can be driven by a mixture of HTTP/RPC requests, MQ messages, in process triggers and still look and behave like one consistent flow.

## Use Cases
### In Memory
If the entire pipeline starts and ends in one call in your process, you need something to drive the entity thought the pipeline. You can either use the [`PipelineDriver`](./lib/PipelineDriver.ts), or develop something similar. See the build pipeline example [here](#simple-build-pipeline-example) and demo [here](#build-pipeline-demo).

### Distributed
If at least one state transition depends on an asynchronous execution (usually on an external systems), an in memory driver is not what you need. In such cases at least parts of the pipeline will have to be driven by external calls such as HTTP callbacks, MQ consumers etc.

#### Example
Lets say you have a pipeline that runs a Kubernetes job. Since Kubernetes jobs can take time to schedule resources and execute, we don't want to do it synchronously. In this case, we would normally have to pause our pipeline and continue the execution when job completes.

Here is what your pipeline state-machine might look like:
```ts
enum JobState {
  Initiated,
  Configured,
  Executed,
  Completed,
  Failed,
  Cancelled
}

// Here is what your pipeline definition might look like
const pipeline = createPipelineBuilder<Job, JobState, JobContext>()
  .withStateRepository(new YourPersistentRepository())
  .withTransitionResolver(
    createTransitionResolverBuilder<Job, JobStats, JobContext>()
      .withTerminalStates(JobState.Completed, JobState.Failed, JobState.Cancelled)
      .withTransition(JobState.Initiated, JobState.Configured, configHandler)
      .withTransition(JobState.Configured, JobState.Executed, executionHandler)
      .withTransition(JobState.Executed, JobState.Completed, completionHandler)
      .build()
  )
  .build()
```

The part we want to focus on here is the transition from `Executed` to `Completed`, which is realized by the `completionHandler`. But first, lets understand how we get to the `Executed` state and what it represents in our pipeline. `Executed` in this case represents the fact that we requested Kubernetes to execute a job successfully. Since we lost contact with the flow, we cannot make any state transitions until the job completes, either successfully or with an error. So what now? Well, we have several options, all are equally valid from the pipeline's perspective.

We can schedule a recurrent polling job to monitor the Kubernetes job's state. In this case, once the polling job identifies that the job completed, it pushes the pipeline to completion by calling `Pipeline.handle(job, ctx)`. If that job is not a part of the process that runs the pipeline, it makes sense that it will send a message or call an API that interacts with the pipeline. Either way the point is clear. 
At this point, the job is in state `Executed`, so calling `Pipeline.handle(job, ctx)` will trigger the transition handler that is associated with this state. In this case it's `completionHandler`.
Alternatively, if we have control over the job's behavior, we can make it call an API or send an MQ message before it exits. In this case, the API controller, or MQ message handler will have to do the same thing.


## Simple Build Pipeline Example
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


// Configuring an memory pipeline driver
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

## Build Pipeline Demo
The demo code can be found [here](examples/build-pipeline) and below is how you can run it.

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