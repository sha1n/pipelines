/* eslint-disable @typescript-eslint/no-unused-vars */
import { createPipelineBuilder } from '../lib/PipelineBuilder';
import { createTransitionResolverBuilder } from '../lib/spi/StaticTransitionResolverBuilder';
import { PipelineDriver } from '../lib/PipelineDriver';
import { Pipeline } from '../lib/Pipeline';
import { InMemoryStateRepository } from '../lib/spi/InMemoryStateRepository';
import { MyEntity, MyContext, MyState } from './examples';
import { fixedRetryPolicy } from '@sha1n/about-time';
import { Chance } from 'chance';
import { NonRecoverablePipelineError } from '../lib/errors';

describe('PipelineDriver', () => {
  const chance = new Chance();
  const expectedError = new Error(chance.string());

  const pipeline = (expectedError: Error): Pipeline<MyEntity, MyState, MyContext> => {
    return createPipelineBuilder<MyEntity, MyState, MyContext>()
      .withStateRepository(new InMemoryStateRepository())
      .withFailedState(MyState.Failed)
      .withOnBeforeHandler(async (entity /*, ctx*/) => {
        entity.evidence.push(chance.string());
        return entity;
      })
      .withTransitionResolver(
        createTransitionResolverBuilder<MyEntity, MyState, MyContext>()
          .withTerminalStates(MyState.Completed, MyState.Failed)
          .withTransition(MyState.A, MyState.B, async entity => {
            return entity;
          })
          .withTransition(MyState.B, MyState.Completed, async entity => {
            if (entity.evidence.length < 3) {
              throw expectedError;
            }
            return entity;
          })
          .build()
      )
      .build();
  };

  test('should fail if a handler fails', async () => {
    const driver = new PipelineDriver(pipeline(expectedError));
    const task = new MyEntity();

    await expect(driver.push(task, {})).rejects.toThrow(expectedError);
  });

  test('should retry when provided with a retry policy and drive the task through to completion', async () => {
    const driver = new PipelineDriver(pipeline(expectedError), fixedRetryPolicy([1]));
    const task = new MyEntity();

    const out = await driver.push(task, {});

    expect(out.state).toEqual(MyState.Completed);
  });

  test('should not retry when a non-recoverable pipeline error is thrown', async () => {
    const driver = new PipelineDriver(pipeline(new NonRecoverablePipelineError()), fixedRetryPolicy([1]));
    const task = new MyEntity();

    const out = await driver.push(task, {});

    expect(out.state).toEqual(MyState.Failed);
  });
});
