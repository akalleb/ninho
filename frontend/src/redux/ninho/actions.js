const actions = {
  CHILDREN_READ_BEGIN: 'CHILDREN_READ_BEGIN',
  CHILDREN_READ_SUCCESS: 'CHILDREN_READ_SUCCESS',
  CHILDREN_READ_ERR: 'CHILDREN_READ_ERR',

  CHILDREN_CREATE_BEGIN: 'CHILDREN_CREATE_BEGIN',
  CHILDREN_CREATE_SUCCESS: 'CHILDREN_CREATE_SUCCESS',
  CHILDREN_CREATE_ERR: 'CHILDREN_CREATE_ERR',

  readChildrenBegin: () => {
    return {
      type: actions.CHILDREN_READ_BEGIN,
    };
  },

  readChildrenSuccess: (data) => {
    return {
      type: actions.CHILDREN_READ_SUCCESS,
      data,
    };
  },

  readChildrenErr: (err) => {
    return {
      type: actions.CHILDREN_READ_ERR,
      err,
    };
  },

  createChildBegin: () => {
    return {
      type: actions.CHILDREN_CREATE_BEGIN,
    };
  },

  createChildSuccess: (data) => {
    return {
      type: actions.CHILDREN_CREATE_SUCCESS,
      data,
    };
  },

  createChildErr: (err) => {
    return {
      type: actions.CHILDREN_CREATE_ERR,
      err,
    };
  },
};

export default actions;
