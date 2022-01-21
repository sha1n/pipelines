import { StatefulPipelineEntity, HandlerContext } from './types';
import { Pipeline } from './Pipeline';
import { retryAround, simpleRetryPolicy, RetryPolicy } from '@sha1n/about-time';
import { createLogger } from './logger';
import { NonRecoverablePipelineError } from './errors';

class PipelineDriver<T extends StatefulPipelineEntity<S>, S, C extends HandlerContext> {
  private readonly logger = createLogger(PipelineDriver.name);

  constructor(
    private readonly pipeline: Pipeline<T, S, C>,
    private readonly retryPolicy: RetryPolicy = simpleRetryPolicy(0, 0)
  ) {}

  async push(entity: T, ctx: C): Promise<T> {
    this.logger.debug('Pushing entity with state [%s]', entity.state);
    const inputState = entity.state;
    const stateHandler = () => this.pipeline.handle(entity, ctx);

    const modified = await retryAround(stateHandler, this.retryPolicy, retryPredicate);

    if (inputState !== modified.state) {
      this.logger.debug('Commencing... state: [%s]', modified.state);
      return this.push(modified, ctx);
    }

    return modified;
  }
}

const retryPredicate = (error: Error) => !(error instanceof NonRecoverablePipelineError);

export { PipelineDriver };
