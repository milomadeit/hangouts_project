import { csrfFetch } from "./csrf";

const LOAD_GROUPS = "loadGroups/LOAD_GROUPS";

const load = (groups) => ({
  type: LOAD_GROUPS,
  groups,
});

export const getGroups = () => async (dispatch) => {
  const response = await csrfFetch("/api/groups", {
    method: "GET",
  });

  if (response.ok) {
    const groups = await response.json();
    dispatch(load(groups.Groups));
  }

  return response;
};

const initialState = { allGroups: {} };

const groupsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_GROUPS: {
      const allGroups = {};

      action.groups.forEach((group) => {
        allGroups[group.id] = group;
      });
      return { ...initialState, allGroups };
    }
    default:
      return initialState;
  }
};

export default groupsReducer;
