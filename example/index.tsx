import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import useEnhancer from '../.';

const thunk = () => next => async action => {
  if(typeof action === 'function') {
    action = await action();
  }
  await next(action);
};
const log = () => next => async () => {
  console.log('i am log brefore');
  await next();
  console.log('i am log after');
};
const saga = () => next => async () => {
  console.log('i am sage before');
  await next();
  console.log('i am saga after');
};
const all = () => next => async () => {
  console.log('i am all before');
  await next();
  console.log('i am all after');
};

const reducer = (state, action) => {
  const { type, payload } = action;
  switch(type) {
    case 'ASYNC_ACTION':
      return {
        ...state,
        ...payload,
      }
    case 'NORMAL_ACTION':
      return {
        ...state,
        ...payload,
      }
    default: 
      return state;
  }
};

const App = () => {
  const [state, rawDispatch] = React.useReducer(reducer, { value: 'initial' });
  const dispatch = useEnhancer(
    state, 
    rawDispatch, 
    thunk,
    log,
    saga,
    all,
  );
  React.useEffect(() => {
    dispatch(async () => {
      await new Promise(r => setTimeout(() => {
        r();
      }, 3000));
      return ({ type: 'ASYNC_ACTION', payload: { value: 'async' } });
    })
  }, [])
  return (
    <div onClick={() => dispatch({
      type: 'NORMAL_ACTION',
      payload: {
        value: 'normal'
      }
    })}>
      {state.value}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
