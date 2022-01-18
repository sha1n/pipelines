import { AssertionError } from 'assert';
import { NonRecoverablePipelineError } from '../../lib/errors';
import { StaticTransitionResolver } from '../../lib/spi/StaticTransitionResolver';
import { Terminal } from '../../lib/spi/types';
import { MyEntity, MyState } from '../examples';
import { aMockHandler } from '../mocks';
import type { TransitionRecord } from '../../lib/spi/types';
import type { HandlerContext } from '../../lib/types';

describe('StaticTransitionResolver', () => {
  describe('registerTerminalState', () => {
    test('should throw when called with a state that has already been registered', () => {
      const resolver = new StaticTransitionResolver<MyEntity, MyState, HandlerContext>();

      resolver.registerTransition(MyState.A, MyState.B, aMockHandler());

      expect(() => resolver.registerTerminalState(MyState.A)).toThrow(AssertionError);
    });

    test('should throw when called with a state that is already registered as terminal state', () => {
      const resolver = new StaticTransitionResolver<MyEntity, MyState, HandlerContext>();

      resolver.registerTerminalState(MyState.A);

      expect(() => resolver.registerTerminalState(MyState.A)).toThrow(AssertionError);
    });

    test('should register a noop handler for the specified state', () => {
      const resolver = new StaticTransitionResolver<MyEntity, MyState, HandlerContext>();
      const entity = new MyEntity(MyState.A);

      resolver.registerTerminalState(MyState.A);

      expect(resolver.resolveTransitionFrom(entity)).toEqual(Terminal);
    });
  });

  describe('registerTransition', () => {
    test('should throw when called with a state that has already been registered', () => {
      const resolver = new StaticTransitionResolver<MyEntity, MyState, HandlerContext>();

      resolver.registerTransition(MyState.A, MyState.B, aMockHandler());

      expect(() => resolver.registerTransition(MyState.A, MyState.Failed, aMockHandler())).toThrow(AssertionError);
    });

    test('should throw when called with a state that is already registered as terminal state', () => {
      const resolver = new StaticTransitionResolver<MyEntity, MyState, HandlerContext>();

      resolver.registerTerminalState(MyState.A);

      expect(() => resolver.registerTransition(MyState.A, MyState.Failed, aMockHandler())).toThrow(AssertionError);
    });

    // eslint-disable-next-line @typescript-eslint/quotes
    test(`should register a handler mapping to transition from the 'from' to the 'to' state`, () => {
      const resolver = new StaticTransitionResolver<MyEntity, MyState, HandlerContext>();
      const entity = new MyEntity(MyState.A);

      resolver.registerTransition(MyState.A, MyState.B, aMockHandler());

      const handler = resolver.resolveTransitionFrom(entity) as TransitionRecord<MyEntity, MyState, HandlerContext>;
      expect(handler.targetState).toEqual(MyState.B);
    });
  });

  describe('resolveTransitionFrom', () => {
    test('should throw a non recoverable error if no handler is registered with the specified state', () => {
      const resolver = new StaticTransitionResolver();
      const entity = new MyEntity(MyState.A);

      expect(() => resolver.resolveTransitionFrom(entity)).toThrow(NonRecoverablePipelineError);
    });
  });
});
