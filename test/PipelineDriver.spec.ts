/* eslint-disable @typescript-eslint/no-unused-vars */
import { createLogger } from '../examples/logger';
import { createPipelineBuilder } from '../lib/PipelineBuilder';
import { createTransitionResolverBuilder } from '../lib/spi/StaticTransitionResolverBuilder';
import { PipelineDriver } from '../lib/PipelineDriver';
import { InMemoryStateRepository } from '../lib/spi/InMemoryStateRepository';
import { MyEntity, MyContext, MyState } from './examples';
import { fixedRetryPolicy } from '@sha1n/about-time';
import { Chance } from 'chance';

describe('PipelineDriver', () => {
  const chance = new Chance();
  const expectedError = new Error(chance.string());
  const pipeline = createPipelineBuilder<MyEntity, MyState, MyContext>()
    .withStateRepository(new InMemoryStateRepository())
    .withOnBeforeHandler(async (entity /*, ctx*/) => {
      entity.evidence.push(chance.string());
      return entity;
    })
    .withTransitionResolver(
      createTransitionResolverBuilder<MyEntity, MyState, MyContext>()
        .withTerminalStates(MyState.Completed, MyState.Failed)
        .withTransition(MyState.A, MyState.B, {
          async handle(entity: MyEntity, ctx: MyContext): Promise<MyEntity> {
            return entity;
          }
        })
        .withTransition(MyState.B, MyState.Completed, {
          async handle(entity: MyEntity, ctx: MyContext): Promise<MyEntity> {
            if (entity.evidence.length < 3) {
              throw expectedError;
            }
            return entity;
          }
        })
        .build()
    )
    .build();

  test('should fail if a handler fails', async () => {
    const driver = new PipelineDriver(pipeline);
    const task = new MyEntity();

    await expect(driver.push(task, {})).rejects.toThrow(expectedError);
  });

  test('should retry when provided with a retry policy and drive the task through to completion', async () => {
    const driver = new PipelineDriver(pipeline, fixedRetryPolicy([1]));
    const task = new MyEntity();

    const out = await driver.push(task, {});

    expect(out.state).toEqual(MyState.Completed);
  });
});
