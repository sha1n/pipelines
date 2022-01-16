import { newLogger } from './logger';
import { createPipeline } from '../../lib/PipelineBuilder';
import { createStaticHandlerResolver } from '../../lib/StaticHandlerResolverBuilder';
import { PipelineDriver } from '../../lib/PipelineDriver';
import { InMemoryStateRepository } from './InMemoryStateRepository';
import { Task, TaskContext, TaskState } from './model';
import { fixedRetryPolicy } from '@sha1n/ontime';
import { Chance } from 'chance';

describe('PipelineDriver', () => {
  const chance = new Chance();
  const expectedError = new Error(chance.string());
  const pipeline = createPipeline<Task, TaskState, TaskContext>()
    .withStateRepository(new InMemoryStateRepository())
    .withOnBeforeHandler(async (entity, ctx) => {
      ctx.execCount += 1;
      ctx.startTime = Date.now();
      return entity;
    })
    .withOnAfterHandler(async (entity, ctx) => {
      ctx.elapsedTime = Date.now() - ctx.startTime;
    })
    .withHandlerResolver(
      createStaticHandlerResolver<Task, TaskState, TaskContext>()
        .withDeadStates(
          TaskState.Completed,
          TaskState.Failed,
          TaskState.Cancelled
        )
        .withTransition(TaskState.Submitted, TaskState.Started, {
          async handle(entity: Task, ctx: TaskContext): Promise<Task> {
            ctx.logger.info('Starting...');
            return entity;
          }
        })
        .withTransition(TaskState.Started, TaskState.Completed, {
          async handle(entity: Task, ctx: TaskContext): Promise<Task> {
            if (ctx.execCount < 3) {
              throw expectedError;
            }
            ctx.logger.info('Completing...');
            return entity;
          }
        })
        .build()
    )
    .build();

  test('should fail if a handler fails', async () => {
    const driver = new PipelineDriver(pipeline);
    const task = new Task();
    const ctx = new TaskContext(newLogger(`demo:task:run:${task.id}`));

    await expect(driver.push(task, ctx)).rejects.toThrow(expectedError);
  });

  test('should retry when provided with a retry policy and drive the task through to completion', async () => {
    const driver = new PipelineDriver(pipeline, fixedRetryPolicy([1]));
    const task = new Task();

    const out = await driver.push(
      task,
      new TaskContext(newLogger(`demo:task:run:${task.id}`))
    );

    expect(out.state).toEqual(TaskState.Completed);
  });
});
