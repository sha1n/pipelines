import type { StatefulPipelineEntity, HandlerContext } from '../lib/types';

enum MyState {
  A,
  B,
  C,
  Completed,
  Failed
}

class MyEntity implements StatefulPipelineEntity<MyState> {
  evidence: string[] = [];

  constructor(public state: MyState = MyState.A) {}

  setFailedState(): void {
    this.state = MyState.Failed;
  }
}

type MyContext = {
  id: string;
} & HandlerContext;

export { MyEntity, MyState, MyContext };
