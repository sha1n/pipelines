import { v4 as uuid } from 'uuid';
import type { StatefulPipelineEntity, HandlerContext } from '../lib/types';

enum MyState {
  A,
  B,
  C,
  Completed,
  Failed
}

class MyEntity implements StatefulPipelineEntity<MyState> {
  id: string = uuid();
  evidence: string[] = [];

  constructor(public state: MyState = MyState.A) {}

  setFailedState(): void {
    this.state = MyState.Failed;
  }
}

type MyContext = HandlerContext;

export { MyEntity, MyState, MyContext };
