import { DefaultTransitionHandler } from '../lib/DefaultTransitionHandler';
import type { HandlerContext, StateRepository } from '../lib/types';
import { MyEntity, MyState } from './examples';
import {
  aHandlerContext,
  aMockHandler,
  aMockRejectingHandler,
  aMockRejectingRepository,
  aMockRepository,
  anError
} from './mocks';

describe('DefaultTransitionHandler', () => {
  test(
    'should call the current status handler and update the next status on success',
    fixture(async ({ entity, nextState, repository, ctx }): Promise<void> => {
      const mockHandler = aMockHandler();

      const handler = new DefaultTransitionHandler<MyEntity, MyState, typeof ctx>(mockHandler, nextState);

      await handler.handle(entity, repository, ctx);

      expect(mockHandler.handle).toHaveBeenCalledWith(entity, ctx);
      expect(mockHandler.handle).toHaveBeenCalledTimes(1);
      expect(repository.update).toHaveBeenCalledWith(entity, ctx);
      expect(repository.update).toHaveBeenCalledOnce();
    })
  );

  test(
    'should fail and not update the next state if the handler fails',
    fixture(async ({ entity, nextState, repository, ctx }): Promise<void> => {
      const expectedError = anError();
      const mockHandler = aMockRejectingHandler(expectedError);

      const handler = new DefaultTransitionHandler<MyEntity, MyState, typeof ctx>(mockHandler, nextState);

      await expect(handler.handle(entity, repository, ctx)).rejects.toThrowError(expectedError);

      expect(mockHandler.handle).toHaveBeenCalledWith(entity, ctx);
      expect(mockHandler.handle).toHaveBeenCalledTimes(1);
      expect(repository.update).not.toHaveBeenCalled();
    })
  );

  test(
    'should fail if the repository fails',
    fixture(async ({ entity, nextState }): Promise<void> => {
      const mockHandler = aMockHandler();
      const expectedError = anError();
      const repository = aMockRejectingRepository(expectedError);
      const ctx = aHandlerContext();

      const handler = new DefaultTransitionHandler<MyEntity, MyState, typeof ctx>(mockHandler, nextState);

      await expect(handler.handle(entity, repository, ctx)).rejects.toThrowError(expectedError);

      expect(mockHandler.handle).toHaveBeenCalledWith(entity, ctx);
      expect(mockHandler.handle).toHaveBeenCalledTimes(1);
      expect(repository.update).toHaveBeenCalledWith(entity, ctx);
      expect(repository.update).toHaveBeenCalledOnce();
    })
  );
});

function fixture(
  runTest: (args: {
    entity: MyEntity;
    nextState: MyState;
    repository: StateRepository<MyEntity, HandlerContext>;
    ctx: HandlerContext;
  }) => Promise<void>
): () => Promise<void> {
  return async () => {
    const entity = new MyEntity();
    const nextState = MyState.Completed;
    const repository = aMockRepository();
    const ctx = aHandlerContext();

    await runTest({ entity, nextState, repository, ctx });
  };
}
