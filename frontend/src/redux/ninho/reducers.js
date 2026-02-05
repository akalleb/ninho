import actions from './actions';

const initialState = {
  children: [],
  loading: false,
  error: null,
};

const {
  CHILDREN_READ_BEGIN,
  CHILDREN_READ_SUCCESS,
  CHILDREN_READ_ERR,
  CHILDREN_CREATE_BEGIN,
  CHILDREN_CREATE_SUCCESS,
  CHILDREN_CREATE_ERR,
} = actions;

const ninhoReducer = (state = initialState, action) => {
  const { type, data, err } = action;
  switch (type) {
    case CHILDREN_READ_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case CHILDREN_READ_SUCCESS:
      return {
        ...state,
        children: data,
        loading: false,
      };
    case CHILDREN_READ_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    case CHILDREN_CREATE_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case CHILDREN_CREATE_SUCCESS:
      return {
        ...state,
        children: [...state.children, data],
        loading: false,
      };
    case CHILDREN_CREATE_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
};

export default ninhoReducer;
