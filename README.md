[![CI](https://github.com/sha1n/pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/sha1n/pipeline/actions/workflows/ci.yml)
[![Coverage](https://github.com/sha1n/pipeline/actions/workflows/coverage.yml/badge.svg)](https://github.com/sha1n/pipeline/actions/workflows/coverage.yml)
![GitHub](https://img.shields.io/github/license/sha1n/pipeline)
# pipeline

**Not published to the public npm registry at this point.**

## Usage Example
```ts
// Building a pipeline for a task
const pipeline = createPipeline<Task, TaskState, TaskContext>()
  .withStateRepository(new InMemoryStateRepository())
  .withOnBeforeHandler(async (entity, ctx) => {
    ctx.startTime = Date.now();
    return entity;
  })
  .withOnAfterHandler(async (entity, ctx) => {
    ctx.elapsedTime = Date.now() - ctx.startTime;
  })
  .withHandlerResolver(
    createStaticHandlerResolver<Task, TaskState, TaskContext>()
      .withTerminalStates(
        TaskState.Completed,
        TaskState.Failed,
        TaskState.Cancelled
      )
      .withTransition(TaskState.Submitted, TaskState.Started, {
        async handle(entity: Task, ctx: TaskContext): Promise<Task> {
          ctx.logger.info('Starting...');
          return entity;
        },
      })
      .withTransition(TaskState.Started, TaskState.Completed, {
        async handle(entity: Task, ctx: TaskContext): Promise<Task> {
          ctx.logger.info('Completing...');
          return entity;
        },
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