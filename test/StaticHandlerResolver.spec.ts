import { AssertionError } from 'assert';
import { DefaultTransitionHandler } from '../lib/DefaultTransitionHandler';
import { NoopTransitionHandler } from '../lib/NoopTransitionHandler';
import { StaticHandlerResolver } from '../lib/StaticHandlerResolver';
import { NonRecoverablePipelineError } from '../lib/errors';
import { MyState } from './examples';
import { aMockHandler } from './mocks';
import type { HandlerContext } from '../lib/spi';
import type { MyEntity } from './examples';

describe('StaticHandlerResolver', () => {
  describe('registerTerminalState', () => {
    test('should throw when called with a state that has already been registered', () => {
      const resolver = new StaticHandlerResolver<MyEntity, MyState, HandlerContext>();

      resolver.registerTransition(MyState.A, MyState.B, aMockHandler());

      expect(() => resolver.registerTerminalState(MyState.A)).toThrow(AssertionError);
    });

    test('should throw when called with a state that is already registered as terminal state', () => {
      const resolver = new StaticHandlerResolver<MyEntity, MyState, HandlerContext>();

      resolver.registerTerminalState(MyState.A);

      expect(() => resolver.registerTerminalState(MyState.A)).toThrow(AssertionError);
    });

    test('should register a noop handler for the specified state', () => {
      const resolver = new StaticHandlerResolver<MyEntity, MyState, HandlerContext>();

      resolver.registerTerminalState(MyState.A);

      expect(resolver.resolveHandlerFor(MyState.A)).toEqual(NoopTransitionHandler);
    });
  });

  describe('registerTransition', () => {
    test('should throw when called with a state that has already been registered', () => {
      const resolver = new StaticHandlerResolver<MyEntity, MyState, HandlerContext>();

      resolver.registerTransition(MyState.A, MyState.B, aMockHandler());

      expect(() => resolver.registerTransition(MyState.A, MyState.Failed, aMockHandler())).toThrow(AssertionError);
    });

    test('should throw when called with a state that is already registered as terminal state', () => {
      const resolver = new StaticHandlerResolver<MyEntity, MyState, HandlerContext>();

      resolver.registerTerminalState(MyState.A);

      expect(() => resolver.registerTransition(MyState.A, MyState.Failed, aMockHandler())).toThrow(AssertionError);
    });

    test(`should register a ${DefaultTransitionHandler.name} to transition from the 'from' to the 'to' state`, () => {
      const resolver = new StaticHandlerResolver<MyEntity, MyState, HandlerContext>();

      resolver.registerTransition(MyState.A, MyState.B, aMockHandler());

      const handler = resolver.resolveHandlerFor(MyState.A) as DefaultTransitionHandler<
        MyEntity,
        MyState,
        HandlerContext
      >;
      expect(handler.targetState).toEqual(MyState.B);
    });
  });

  describe('resolveHandlerFor', () => {
    test('should throw a non recoverable error if no handler is registered with the specified state', () => {
      const resolver = new StaticHandlerResolver();

      expect(() => resolver.resolveHandlerFor(MyState.A)).toThrow(NonRecoverablePipelineError);
    });
  });
});
