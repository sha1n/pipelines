import { AssertionError } from 'assert';
import { mock } from 'jest-mock-extended';
import { createPipelineBuilder } from '../lib/PipelineBuilder';
import { MyEntity } from './examples';
import {
  aMockFailingHandlerResolver,
  aMockHandlerResolver,
  aMockRejectingErrorHandler,
  aMockRepository,
  aMockResolvingAfterHandler,
  aMockResolvingBeforeHandler,
  anError
} from './mocks';
import type { TransitionResolver } from '../lib/spi/types';
import type { HandlerContext, StateRepository } from '../lib/types';
import type { MyState } from './examples';

describe('PipelineBuilder', () => {
  describe('should throw', () => {
    test('when no handler resolver is specified', () => {
      const buildWithoutResolver = () =>
        createPipelineBuilder<MyEntity, MyState, HandlerContext>()
          .withStateRepository(mock<StateRepository<MyEntity, HandlerContext>>())
          .withErrorHandler((err, entity) => Promise.resolve(entity))
          .build();

      expect(buildWithoutResolver).toThrow(AssertionError);
      expect(buildWithoutResolver).toThrow(/.* handler resolver .*/);
    });

    test('when no repository is specified', () => {
      const buildWithoutRepository = () =>
        createPipelineBuilder<MyEntity, MyState, HandlerContext>()
          .withTransitionResolver(mock<TransitionResolver<MyEntity, MyState, HandlerContext>>())
          .withErrorHandler((err, entity) => Promise.resolve(entity))
          .build();

      expect(buildWithoutRepository).toThrow(AssertionError);
      expect(buildWithoutRepository).toThrow(/.* repository .*/);
    });
  });

  test('should build a working pipeline handler with before and after handlers', async () => {
    const entity = new MyEntity();
    const mockRepository = aMockRepository();
    const mockHandlerResolver = aMockHandlerResolver();
    const mockResolvingBeforeHandler = aMockResolvingBeforeHandler();
    const mockResolvingAfterHandler = aMockResolvingAfterHandler();
    const context = mock<HandlerContext>();

    const build = () =>
      createPipelineBuilder<MyEntity, MyState, HandlerContext>()
        .withStateRepository(mockRepository)
        .withTransitionResolver(mockHandlerResolver)
        .withOnBeforeHandler(mockResolvingBeforeHandler)
        .withOnAfterHandler(mockResolvingAfterHandler)
        .build();

    const pipelineHandler = build();
    expect(pipelineHandler).toBeDefined();

    await expect(pipelineHandler.handle(entity, context)).resolves.toEqual(entity);

    expect(mockHandlerResolver.resolveTransitionFrom).toHaveBeenLastCalledWith(entity, context);
    expect(mockResolvingBeforeHandler).toBeCalledWith(entity, context);
    expect(mockResolvingAfterHandler).toBeCalledWith(entity, context);
  });

  test('should build a working pipeline handler with custom error handler', async () => {
    const expectedError = anError();
    const entity = new MyEntity();
    const mockErrorHandler = aMockRejectingErrorHandler();
    const context = mock<HandlerContext>();

    const build = () =>
      createPipelineBuilder<MyEntity, MyState, HandlerContext>()
        .withStateRepository(aMockRepository())
        .withTransitionResolver(aMockFailingHandlerResolver(expectedError))
        .withErrorHandler(mockErrorHandler)
        .build();

    const pipelineHandler = build();
    expect(pipelineHandler).toBeDefined();

    await expect(pipelineHandler.handle(entity, context)).rejects.toThrow(expectedError);

    expect(mockErrorHandler).toBeCalledWith(expectedError, entity, context);
  });
});
