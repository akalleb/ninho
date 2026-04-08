import actions from './actions';

const {
  SINGLE_PROJECT_BEGIN,
  SINGLE_PROJECT_SUCCESS,
  SINGLE_PROJECT_ERR,

  FILTER_PROJECT_BEGIN,
  FILTER_PROJECT_SUCCESS,
  FILTER_PROJECT_ERR,

  SORTING_PROJECT_BEGIN,
  SORTING_PROJECT_SUCCESS,
  SORTING_PROJECT_ERR,
} = actions;

const initialStateFilter = {
  data: [],
  loading: false,
  error: null,
};

const projectReducer = (state = initialStateFilter, action) => {
  const { type, data, err } = action;
  switch (type) {
    case FILTER_PROJECT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FILTER_PROJECT_SUCCESS:
      return {
        ...state,
        data,
        loading: false,
        error: null,
      };
    case FILTER_PROJECT_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    case SORTING_PROJECT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SORTING_PROJECT_SUCCESS:
      return {
        ...state,
        data,
        loading: false,
        error: null,
      };
    case SORTING_PROJECT_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
};

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const SingleProjectReducer = (state = initialState, action) => {
  const { type, data, err } = action;
  switch (type) {
    case SINGLE_PROJECT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SINGLE_PROJECT_SUCCESS:
      return {
        ...state,
        data,
        loading: false,
        error: null,
      };
    case SINGLE_PROJECT_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
};

export { SingleProjectReducer, projectReducer };
