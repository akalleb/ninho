import actions from './actions';
import api from '../../config/api/axios';

const {
  singleProjectBegin,
  singleProjectSuccess,
  singleProjectErr,

  filterProjectBegin,
  filterProjectSuccess,
  filterProjectErr,

  sortingProjectBegin,
  sortingProjectSuccess,
  sortingProjectErr,
} = actions;

const filterSinglePage = (paramsId) => {
  return async (dispatch) => {
    try {
      dispatch(singleProjectBegin());
      const response = await api.get(`/projects/${paramsId}`);
      dispatch(singleProjectSuccess([response.data]));
    } catch (err) {
      dispatch(singleProjectErr(err));
    }
  };
};

const filterProjectByStatus = (status) => {
  return async (dispatch) => {
    try {
      dispatch(filterProjectBegin());
      const params = {};
      if (status && status !== 'all') {
        params.status = status;
      }
      const response = await api.get('/projects/', { params });
      dispatch(filterProjectSuccess(response.data || []));
    } catch (err) {
      dispatch(filterProjectErr(err.toString()));
    }
  };
};

const sortingProjectByCategory = (sortBy) => {
  return async (dispatch, getState) => {
    try {
      dispatch(sortingProjectBegin());
      const {
        projects: { data },
      } = getState();
      const sorted = [...(data || [])].sort((a, b) => {
        if (b[sortBy] === undefined || a[sortBy] === undefined) return 0;
        return b[sortBy] - a[sortBy];
      });
      dispatch(sortingProjectSuccess(sorted));
    } catch (err) {
      dispatch(sortingProjectErr(err));
    }
  };
};

const createProject = (payload) => {
  return async (dispatch, getState) => {
    try {
      const response = await api.post('/projects/', payload);
      const project = response.data;

      const {
        projects: { data },
      } = getState();

      const updatedList = [project, ...(data || [])];
      dispatch(filterProjectSuccess(updatedList));
      return project;
    } catch (err) {
      throw err;
    }
  };
};

const deleteProject = (id) => {
  return async (dispatch, getState) => {
    try {
      await api.delete(`/projects/${id}`);
      const {
        projects: { data },
      } = getState();
      const updatedList = (data || []).filter((project) => Number(project.id) !== Number(id));
      dispatch(filterProjectSuccess(updatedList));
      dispatch(singleProjectSuccess([]));
    } catch (err) {
      throw err;
    }
  };
};

export { filterSinglePage, filterProjectByStatus, sortingProjectByCategory, createProject, deleteProject };
