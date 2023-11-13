import { csrfFetch } from "./csrf";

const LOAD_GROUPS = "loadGroups/LOAD_GROUPS";
const GET_GROUP_DETAIL = "getGroupDetail/GET_GROUP_DETAIL";
const CREATE_GROUP = "createGroup/CREATE_GROUP";
const UPDATE_GROUP = "updateGroup/UPDATE_GROUP";
// const GET_GROUP_EVENTS = "getGroupEvents/GET_GROUP_EVENTS";

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

// const loadGroupEvents = (events) => ({
//   type: GET_GROUP_EVENTS,
//   events,
// });

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
  console.log(data, "this is thunk data");
  console.log(response, "this is thunk response");
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
  // console.log(errorData);
  // console.log(response);
  return errorData;
};

// export const getGroupEvents = (groupId) => async (dispatch) => {
//   const response = await csrfFetch(`/api/${groupId}/events`, {
//     method: "GET",
//   });

//   if (response.ok) {
//     const events = await response.json();
//     dispatch(loadGroupEvents);
//     return events;
//   }

//   const errorData = await response.json();
//   return errorData;
// };

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
