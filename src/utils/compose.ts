import { check } from './check';
import { TNext } from './type';

type TCompose = (callbacks: TCallback[], options?: Partial<TOptions>) => TLink;
type TCallback = (next: TNext) => TLinkCallback;
type TLinkCallback = (...args: any[]) => Promise<any>;

type TLink = {
  callback: TLinkCallback;
  prev: TLink;
  next: TLink;
} | null;

type TAction = {
  type: string;
  payload: any;
} | null;

type TEffect = {
  action: TAction;
  next: TEffect | null;
} | null;

type TOptions = {
  onCapture: () => void;
  onTarget: (effect: TEffect) => void;
  onBubble: () => void;
}

export const compose: TCompose = (callbacks, options = {}) => {
  let head: TLink = null;
  let tail: TLink = null;
  let chain: TLink = null;
  let current: TLink = null;
  let effect: TEffect = null;
  let isExecuting: boolean = false;
  let isDispatchWithoutAction: boolean = false;
  const next: TNext = async derivedAction => {
    if(isExecuting) {
      return;
    }
    if(derivedAction) {
      check(derivedAction);
      if(!effect) {
        effect = {
          action: derivedAction,
          next: null,
        }
      } else {
        effect = effect.next = {
          action: derivedAction,
          next: null,
        }
      }
    }
    if(!current) {
      current = head;
    }
    current = current!.next;
    if(current) {
      if(isDispatchWithoutAction) {
        await current.callback();
        return;
      }
      await current.callback(effect?.action);
      return;
    }
    try {
      isExecuting = true;
      const { onTarget } = options;
      if(onTarget) {
        onTarget(effect);
      }
    } finally {
      isExecuting = false;
    }
  }
  callbacks.forEach(_c => {
    if(!chain) {
      head = tail = chain = {
        callback: action => {
          if(!action) {
            isDispatchWithoutAction = true;
            return _c(next)();
          }
          effect = {
            action,
            next: null,
          }
          return _c(next)(action)
        },
        prev: null,
        next: null,
      }
      return;
    }
    tail = tail!.next = {
      callback: _c(next),
      prev: tail,
      next: null,
    }
  })
  return chain;
}