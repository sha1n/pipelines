import { retryAround, RetryPolicy, simpleRetryPolicy } from '@sha1n/about-time';
import { HandlerContext, StatefulPipelineEntity } from './types';
import { NonRecoverablePipelineError } from './errors';
import { createLogger } from './logger';
import { Pipeline } from './Pipeline';

function createPump<T extends StatefulPipelineEntity<S>, S, C extends HandlerContext>(
  pipeline: Pipeline<T, S, C>,
  retryPolicy: RetryPolicy = simpleRetryPolicy(0, 0)
) {
  const logger = createLogger('pump');

  const pump = async (entity: T, ctx: C): Promise<T> => {
    logger.debug('Pushing entity with state [%s]', entity.state);
    const inputState = entity.state;
    const stateHandler = () => pipeline.handle(entity, ctx);

    const modified = await retryAround(stateHandler, retryPolicy, retryPredicate);

    if (inputState !== modified.state) {
      logger.debug('Commencing... state: [%s]', modified.state);
      return pump(modified, ctx);
    }

    return modified;
  };

  return pump;
}

const retryPredicate = (error: Error) => !(error instanceof NonRecoverablePipelineError);

export default createPump;
