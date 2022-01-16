import type { Stateful, HandlerContext } from '../lib/types';

enum MyState {
  A,
  B,
  Completed,
  Failed
}

class MyEntity implements Stateful<MyState> {
  state: MyState = MyState.A;
  evidence: string[] = [];

  getState(): MyState {
    return this.state;
  }
}

type MyContext = {
  id: string;
} & HandlerContext;

export { MyEntity, MyState, MyContext };
