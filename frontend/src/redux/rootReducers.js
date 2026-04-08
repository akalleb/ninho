import { combineReducers } from 'redux';
import authReducer from './authentication/reducers';
import ChangeLayoutMode from './themeLayout/reducers';
import ninhoReducer from './ninho/reducers';
import { projectReducer, SingleProjectReducer } from './project/reducers';

const rootReducers = combineReducers({
  ninho: ninhoReducer,
  auth: authReducer,
  projects: projectReducer,
  project: SingleProjectReducer,
  ChangeLayoutMode,
});

export default rootReducers;
