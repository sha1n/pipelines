import { v4 as uuid } from 'uuid';
import { mock, mockFn } from 'jest-mock-extended';
import { NonRecoverablePipelineError } from '../lib/errors';
import type { Handler, HandlerContext } from '../lib/spi';
import type {
  OnErrorHandler,
  HandlerResolver,
  StateRepository,
  OnBeforeHandler,
  OnAfterHandler,
  TransitionHandler
} from '../lib/types';
import type { MyEntity, MyState } from './examples';

function aMockHandler(): Handler<MyEntity, HandlerContext> {
  const handler = mock<Handler<MyEntity, HandlerContext>>();

  handler.handle.mockImplementation(entity => {
    return Promise.resolve(entity);
  });

  return handler;
}

function aMockRejectingHandler(error: Error): Handler<MyEntity, HandlerContext> {
  const handler = mock<Handler<MyEntity, HandlerContext>>();

  handler.handle.mockImplementation(() => {
    return Promise.reject(error);
  });

  return handler;
}

function aMockRepository(): StateRepository<MyEntity, HandlerContext> {
  const repo = mock<StateRepository<MyEntity, HandlerContext>>();

  repo.update.mockImplementation(entity => {
    return Promise.resolve(entity);
  });

  return repo;
}

function aMockRejectingRepository(error: Error): StateRepository<MyEntity, HandlerContext> {
  const repo = mock<StateRepository<MyEntity, HandlerContext>>();

  repo.update.mockImplementation(() => {
    return Promise.reject(error);
  });

  return repo;
}

function aMockHandlerResolver(): HandlerResolver<MyEntity, MyState, HandlerContext> {
  const resolver = mock<HandlerResolver<MyEntity, MyState, HandlerContext>>();
  resolver.resolveHandlerFor.mockImplementation(() => {
    return <TransitionHandler<MyEntity, HandlerContext>>{
      handle(entity: MyEntity): Promise<MyEntity> {
        return Promise.resolve(entity);
      }
    };
  });

  return resolver;
}

function aMockFailingHandlerResolver(error: Error): HandlerResolver<MyEntity, MyState, HandlerContext> {
  const resolver = mock<HandlerResolver<MyEntity, MyState, HandlerContext>>();
  resolver.resolveHandlerFor.mockImplementation(() => {
    return <TransitionHandler<MyEntity, HandlerContext>>{
      handle(): Promise<MyEntity> {
        return Promise.reject(error);
      }
    };
  });

  return resolver;
}

function aMockResolvingErrorHandler(resolveWith?: MyEntity): OnErrorHandler<MyEntity, HandlerContext> {
  const handler = mockFn<OnErrorHandler<MyEntity, HandlerContext>>();
  handler.mockImplementation((_, entity) => {
    return Promise.resolve(resolveWith || entity);
  });

  return handler;
}

function aMockRejectingErrorHandler(rejectWith?: Error): OnErrorHandler<MyEntity, HandlerContext> {
  const handler = mockFn<OnErrorHandler<MyEntity, HandlerContext>>();
  handler.mockImplementation(error => {
    return Promise.reject(rejectWith || error);
  });

  return handler;
}

function aMockResolvingBeforeHandler(): OnBeforeHandler<MyEntity, HandlerContext> {
  const handler = mockFn<OnBeforeHandler<MyEntity, HandlerContext>>();
  handler.mockImplementation(entity => {
    return Promise.resolve(entity);
  });

  return handler;
}

function aMockRejectingBeforeHandler(error: Error): OnBeforeHandler<MyEntity, HandlerContext> {
  const handler = mockFn<OnBeforeHandler<MyEntity, HandlerContext>>();
  handler.mockImplementation(() => {
    return Promise.reject(error);
  });

  return handler;
}

function aMockResolvingAfterHandler(): OnAfterHandler<MyEntity, HandlerContext> {
  const handler = mockFn<OnAfterHandler<MyEntity, HandlerContext>>();
  handler.mockImplementation(() => {
    return Promise.resolve();
  });

  return handler;
}

function aMockRejectingAfterHandler(error: Error): OnAfterHandler<MyEntity, HandlerContext> {
  const handler = mockFn<OnAfterHandler<MyEntity, HandlerContext>>();
  handler.mockImplementation(() => {
    return Promise.reject(error);
  });

  return handler;
}

function aNonRecoverablePipelineError(): NonRecoverablePipelineError {
  return new NonRecoverablePipelineError(`non-recoverable-${uuid()}`);
}

function anError(): Error {
  return new Error(uuid());
}

function aUUID(): string {
  return uuid();
}

function aHandlerContext() {
  return {};
}

export {
  aMockFailingHandlerResolver,
  aMockResolvingErrorHandler,
  aMockHandlerResolver,
  aMockRepository,
  aMockResolvingAfterHandler,
  aMockResolvingBeforeHandler,
  aMockRejectingErrorHandler,
  aMockRejectingAfterHandler,
  aMockRejectingBeforeHandler,
  aMockHandler,
  aNonRecoverablePipelineError,
  aMockRejectingHandler,
  aMockRejectingRepository,
  aHandlerContext,
  aUUID,
  anError
};
