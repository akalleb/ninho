import actions from './actions';
import api from '../../config/api/axios';

const {
  readChildrenBegin,
  readChildrenSuccess,
  readChildrenErr,
  createChildBegin,
  createChildSuccess,
  createChildErr,
} = actions;

const readChildren = () => {
  return async (dispatch) => {
    try {
      dispatch(readChildrenBegin());
      const response = await api.get('/children/');
      dispatch(readChildrenSuccess(response.data));
    } catch (err) {
      dispatch(readChildrenErr(err));
    }
  };
};

const createChild = (childData) => {
  return async (dispatch) => {
    try {
      dispatch(createChildBegin());
      const response = await api.post('/children/', childData);
      dispatch(createChildSuccess(response.data));
    } catch (err) {
      dispatch(createChildErr(err));
    }
  };
};

export { readChildren, createChild };
