import { createPipeline } from '../lib/PipelineBuilder';
import { MyEntity } from './examples';
import {
  aMockFailingHandlerResolver,
  aMockHandlerResolver,
  aMockRejectingAfterHandler,
  aMockRejectingBeforeHandler,
  aMockRejectingErrorHandler,
  aMockRepository,
  aMockResolvingErrorHandler,
  aNonRecoverablePipelineError,
  anError,
  aUUID,
  aHandlerContext
} from './mocks';
import type { StateRepository } from '../lib/types';
import type { MyContext, MyState } from './examples';

describe('Pipeline', () => {
  test(
    'should resolve with successful handler result',
    fixture(async ({ entity, repository, ctx }) => {
      const pipeline = createPipeline()
        .withStateRepository(repository)
        .withTransitionResolver(aMockHandlerResolver())
        .build();

      await expect(pipeline.handle(entity, ctx)).resolves.toEqual(entity);
      expect(repository.update).toHaveBeenCalledTimes(1);
      expect(repository.update).toHaveBeenCalledWith(entity, ctx);
    })
  );

  test(
    'should reject with handler error',
    fixture(async ({ entity, repository, ctx }) => {
      const expectedError = anError();
      const pipeline = createPipeline()
        .withStateRepository(repository)
        .withTransitionResolver(aMockFailingHandlerResolver(expectedError))
        .build();

      await expect(pipeline.handle(entity, ctx)).rejects.toThrow(expectedError);
      expect(repository.update).toHaveBeenCalledTimes(0);
    })
  );

  test(
    'should resolve and fall to failed state when a non-recoverable error is thrown by the handler',
    fixture(async ({ entity, repository, ctx }) => {
      const expectedError = aNonRecoverablePipelineError();
      const pipeline = createPipeline()
        .withStateRepository(repository)
        .withTransitionResolver(aMockFailingHandlerResolver(expectedError))
        .build();

      await expect(pipeline.handle(entity, ctx)).resolves.toEqual(entity);
      expect(repository.update).toHaveBeenCalledTimes(1);
      expect(repository.update).toHaveBeenCalledWith(entity, ctx);
    })
  );

  test(
    'should reject with before handler error',
    fixture(async ({ entity, repository, ctx }) => {
      const expectedError = anError();
      const pipeline = createPipeline<MyEntity, MyState, MyContext>()
        .withStateRepository(repository)
        .withTransitionResolver(aMockHandlerResolver())
        .withOnBeforeHandler(aMockRejectingBeforeHandler(expectedError))
        .build();

      await expect(pipeline.handle(entity, ctx)).rejects.toThrow(expectedError);
    })
  );

  test(
    'should resolve and fall to failed state when a non-recoverable error is thrown by the before handler',
    fixture(async ({ entity, repository, ctx }) => {
      const expectedError = aNonRecoverablePipelineError();
      const pipeline = createPipeline<MyEntity, MyState, MyContext>()
        .withStateRepository(repository)
        .withTransitionResolver(aMockHandlerResolver())
        .withOnBeforeHandler(aMockRejectingBeforeHandler(expectedError))
        .build();

      await expect(pipeline.handle(entity, ctx)).resolves.toEqual(entity);
      expect(repository.update).toHaveBeenCalledTimes(1);
      expect(repository.update).toHaveBeenCalledWith(entity, ctx);
    })
  );

  test(
    'should reject with after handler error',
    fixture(async ({ entity, repository, ctx }) => {
      const expectedError = anError();
      const pipeline = createPipeline<MyEntity, MyState, MyContext>()
        .withStateRepository(repository)
        .withTransitionResolver(aMockHandlerResolver())
        .withOnAfterHandler(aMockRejectingAfterHandler(expectedError))
        .build();

      await expect(pipeline.handle(entity, ctx)).rejects.toThrow(expectedError);
    })
  );

  test(
    'should resolve and fall to failed state when a non-recoverable error is thrown by the after handler',
    fixture(async ({ entity, repository, ctx }) => {
      const expectedError = aNonRecoverablePipelineError();
      const pipeline = createPipeline<MyEntity, MyState, MyContext>()
        .withStateRepository(repository)
        .withTransitionResolver(aMockHandlerResolver())
        .withOnAfterHandler(aMockRejectingAfterHandler(expectedError))
        .build();

      await expect(pipeline.handle(entity, ctx)).resolves.toEqual(entity);
      expect(repository.update).toHaveBeenCalledTimes(2 /* once to update the state and once to set failed */);
      expect(repository.update).toHaveBeenCalledWith(entity, ctx);
    })
  );

  test(
    'should call custom error handler and reflect its resolution',
    fixture(async ({ entity, repository, ctx }) => {
      const pipeline = createPipeline<MyEntity, MyState, MyContext>()
        .withStateRepository(repository)
        .withTransitionResolver(aMockFailingHandlerResolver(anError()))
        .withErrorHandler(aMockResolvingErrorHandler(entity))
        .build();

      await expect(pipeline.handle(entity, ctx)).resolves.toEqual(entity);

      expect(repository.update).toHaveBeenCalledTimes(0);
    })
  );

  test(
    'should call custom error handler and dont interact with the repository even when a non-recoverable error is thrown',
    fixture(async ({ entity, repository, ctx }) => {
      const handlerError = aNonRecoverablePipelineError();
      const expectedError = aNonRecoverablePipelineError();
      const pipeline = createPipeline<MyEntity, MyState, MyContext>()
        .withStateRepository(repository)
        .withTransitionResolver(aMockFailingHandlerResolver(handlerError))
        .withErrorHandler(aMockRejectingErrorHandler(expectedError))
        .build();

      await expect(pipeline.handle(entity, ctx)).rejects.toThrow(expectedError);

      expect(repository.update).toHaveBeenCalledTimes(0);
    })
  );
});

function fixture(
  runTest: (args: {
    entity: MyEntity;
    repository: StateRepository<MyEntity, MyContext>;
    ctx: MyContext;
  }) => Promise<void>
): () => Promise<void> {
  return async () => {
    const entity = new MyEntity();
    const ctx = {
      ...aHandlerContext(),
      id: aUUID()
    };
    const repository = aMockRepository();

    await runTest({ entity, repository, ctx });
  };
}
