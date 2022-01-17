import type { StatefulPipelineEntity, HandlerContext } from '../lib/types';

enum MyState {
  A,
  B,
  Completed,
  Failed
}

class MyEntity implements StatefulPipelineEntity<MyState> {
  state: MyState = MyState.A;
  evidence: string[] = [];

  setFailedState(): void {
    this.state = MyState.Failed;
  }
}

type MyContext = {
  id: string;
} & HandlerContext;

export { MyEntity, MyState, MyContext };
