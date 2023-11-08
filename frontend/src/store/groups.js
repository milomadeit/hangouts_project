import { csrfFetch } from "./csrf";

const LOAD_GROUPS = "loadGroups/LOAD_GROUPS";
const GET_GROUP_DETAIL = "getGroupDetail/GET_GROUP_DETAIL";

const load = (groups) => ({
  type: LOAD_GROUPS,
  groups,
});

const loadGroupDetail = (group) => ({
  type: GET_GROUP_DETAIL,
  group,
});

export const getGroups = () => async (dispatch) => {
  const response = await csrfFetch("/api/groups", {
    method: "GET",
  });

  if (response.ok) {
    const groups = await response.json();
    dispatch(load(groups.Groups));
    return groups;
  }

  return response;
};

export const getGroupDetail = (groupId) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${groupId}`);

  if (response.ok) {
    const group = await response.json();
    dispatch(loadGroupDetail(group));

    return group;
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
      return {
        ...state,
        allGroups,
      };
    }
    case GET_GROUP_DETAIL: {
      return {
        ...state,
        currentGroup: action.group,
      };
    }
    default:
      return state;
  }
};
export default groupsReducer;
