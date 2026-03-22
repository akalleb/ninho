import { combineReducers } from 'redux';
import authReducer from './authentication/reducers';
import ChangeLayoutMode from './themeLayout/reducers';
import ninhoReducer from './ninho/reducers';
import { projectReducer } from './project/reducers';

const rootReducers = combineReducers({
  ninho: ninhoReducer,
  auth: authReducer,
  projects: projectReducer,
  ChangeLayoutMode,
});

export default rootReducers;
