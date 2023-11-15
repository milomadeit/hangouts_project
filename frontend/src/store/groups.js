import { csrfFetch } from "./csrf";

const LOAD_GROUPS = "loadGroups/LOAD_GROUPS";
const GET_GROUP_DETAIL = "getGroupDetail/GET_GROUP_DETAIL";
const CREATE_GROUP = "createGroup/CREATE_GROUP";
const UPDATE_GROUP = "updateGroup/UPDATE_GROUP";
const DELETE_GROUP = "deleteGroup/DELETE_GROUP";

const load = (groups) => ({
  type: LOAD_GROUPS,
  groups,
});

const loadGroupDetail = (group) => ({
  type: GET_GROUP_DETAIL,
  group,
});

const loadNewGroup = (group) => ({
  type: CREATE_GROUP,
  group,
});

const loadUpdatedGroup = (group) => ({
  type: UPDATE_GROUP,
  group,
});

const loadDeletedGroup = (groupId) => ({
  type: DELETE_GROUP,
  groupId,
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
  const response = await csrfFetch(`/api/groups/${groupId}`, {
    method: "GET",
  });

  if (response.ok) {
    const group = await response.json();
    dispatch(loadGroupDetail(group));

    return group;
  }
  const data = response.json();
  return response;
};

export const createGroup = (groupData) => async (dispatch) => {
  const response = await csrfFetch("/api/groups", {
    method: "POST",
    body: JSON.stringify(groupData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const group = await response.json();
    await dispatch(loadNewGroup(group));
    return group;
  }

  const errorData = await response.json();
  return errorData;
};

export const updateGroup = (groupData, groupId) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${groupId}`, {
    method: "PUT",
    body: JSON.stringify(groupData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const group = await response.json();
    dispatch(loadNewGroup(group));
    return group;
  }

  const errorData = await response.json(); // Parse the JSON from the original response

  return errorData;
};

export const deleteGroup = (groupId) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${groupId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    const successMessage = await response.json();
    dispatch(loadDeletedGroup(groupId));
    return successMessage;
  }
  const errorData = await response.json();
  return errorData;
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
    case CREATE_GROUP: {
      const newState = {
        ...state,
        allGroups: {
          ...state.allGroups,
          [action.group.id]: action.group,
        },
      };
      return newState;
    }
    case UPDATE_GROUP: {
      const updatedGroup = action.group;
      return {
        ...state,
        allGroups: {
          ...state.allGroups,
          [updatedGroup.id]: updatedGroup,
        },
        currentGroup: updatedGroup,
      };
    }
    case DELETE_GROUP: {
      const groupToDelete = action.groupId;
      // destructure the group to remove out of the allGroups state
      const { [groupToDelete]: deletedGroup, ...remainingGroups } =
        state.allGroups;

      // return the current state plus allGroups with remainingGroups
      return {
        ...state,
        allGroups: remainingGroups,
      };
    }
    default:
      return state;
  }
};
export default groupsReducer;

// case GET_GROUP_EVENTS: {
//   const groupEvents = {};
//   action.events.forEach((event) => {
//     groupEvents[event.id] = event;
//   });
//   return {
//     ...state,
//     groupEvents,
//   };
// }
