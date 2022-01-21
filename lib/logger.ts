/* eslint-disable @typescript-eslint/no-explicit-any */
import { debug as _debug } from 'debug';

const rootNamespace = 'pipelines';

interface Logger {
  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

function createLogger(namespace: string): Logger {
  return {
    info: _debug(`${rootNamespace}:info:${namespace}`),
    debug: _debug(`${rootNamespace}:debug:${namespace}`),
    error: _debug(`${rootNamespace}:error:${namespace}`)
  };
}

const info = _debug(`${rootNamespace}:info`);
const debug = _debug(`${rootNamespace}:debug`);
const error = _debug(`${rootNamespace}:error`);

export { Logger, createLogger, info, debug, error };
