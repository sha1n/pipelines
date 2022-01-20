[![CI](https://github.com/sha1n/pipelines/actions/workflows/ci.yml/badge.svg)](https://github.com/sha1n/pipelines/actions/workflows/ci.yml)
[![Coverage](https://github.com/sha1n/pipelines/actions/workflows/coverage.yml/badge.svg)](https://github.com/sha1n/pipelines/actions/workflows/coverage.yml)
![GitHub](https://img.shields.io/github/license/sha1n/pipelines)
![npm type definitions](https://img.shields.io/npm/types/@sha1n/pipelines)
![npm](https://img.shields.io/npm/v/@sha1n/pipelines)

# Pipelines
A mini-framework for building state driven pipelines. A pipeline can be a simple chain of responsibilities that run in process, but it really gets interesting when the process is distributed.

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

## Usage Example
```ts
// Building a pipeline for a task
  const pipeline = createPipelineBuilder<Task, TaskState, TaskContext>()
    .withStateRepository(new InMemoryStateRepository())
    .withOnBeforeHandler(async (entity /*, ctx*/) => {
      entity.execCount += 1;
      entity.startTime = Date.now();
      return entity;
    })
    .withOnAfterHandler(async (entity /*, ctx*/) => {
      entity.elapsedTime = Date.now() - entity.startTime;
    })
    .withTransitionResolver(
      createTransitionResolverBuilder<Task, TaskState, TaskContext>()
        .withTerminalStates(TaskState.Completed, TaskState.Failed, TaskState.Cancelled)
        .withTransition(TaskState.Submitted, TaskState.Started, {
          async handle(entity: Task, ctx: TaskContext): Promise<Task> {
            ctx.logger.info('Starting...');
            return entity;
          }
        })
        .withTransition(TaskState.Started, TaskState.Completed, {
          async handle(entity: Task, ctx: TaskContext): Promise<Task> {
            if (entity.execCount < 3) {
              throw expectedError;
            }
            ctx.logger.info('Completing...');
            return entity;
          }
        })
        .build()
    )
    .build();


// Configuring a pipeline driver
const handlerRetryPolicy = simpleRetryPolicy(3, 100, TimeUnit.Milliseconds);
const driver = new PipelineDriver(pipeline, handlerRetryPolicy);

// Using the pipeline driver to run a task
const task = new Task();
await driver.push(task, {
  logger: newLogger(`demo:task:run:${task.id}`),
});

```
