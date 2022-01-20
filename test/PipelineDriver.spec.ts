import { newLogger } from '../examples/logger';
import { createPipelineBuilder } from '../lib/PipelineBuilder';
import { createTransitionResolverBuilder } from '../lib/spi/StaticTransitionResolverBuilder';
import { PipelineDriver } from '../lib/PipelineDriver';
import { InMemoryStateRepository } from '../lib/spi/InMemoryStateRepository';
import { Task, TaskContext, TaskState } from '../examples/model';
import { fixedRetryPolicy } from '@sha1n/about-time';
import { Chance } from 'chance';

describe('PipelineDriver', () => {
  const chance = new Chance();
  const expectedError = new Error(chance.string());
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

  test('should fail if a handler fails', async () => {
    const driver = new PipelineDriver(pipeline);
    const task = new Task();
    const logger = newLogger(`demo:task:run:${task.id}`);

    await expect(driver.push(task, { logger })).rejects.toThrow(expectedError);
  });

  test('should retry when provided with a retry policy and drive the task through to completion', async () => {
    const driver = new PipelineDriver(pipeline, fixedRetryPolicy([1]));
    const task = new Task();
    const logger = newLogger(`demo:task:run:${task.id}`);

    const out = await driver.push(task, { logger });

    expect(out.state).toEqual(TaskState.Completed);
  });
});
