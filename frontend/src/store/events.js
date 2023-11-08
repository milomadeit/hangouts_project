import { csrfFetch } from "./csrf";

const LOAD_ALL_EVENTS = "loadAllEvents/LOAD_ALL_EVENTS";
const LOAD_GROUP_EVENTS = "loadGroupEvents/LOAD_GROUP_EVENTS";

const loadEvents = (events) => ({
  type: LOAD_ALL_EVENTS,
  events,
});

const loadGroupEvents = (events) => ({
  type: LOAD_GROUP_EVENTS,
  events,
});

export const getEvents = () => async (dispatch) => {
  const response = await csrfFetch("/api/events");

  if (response.ok) {
    const events = await response.json();
    dispatch(loadEvents(events));
    return events;
  }

  return response;
};

export const getGroupEvents = (groupId) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${groupId}/events`);

  if (response.ok) {
    const { Events } = await response.json();
    dispatch(loadGroupEvents(Events));
    return Events;
  }

  return response;
};

const initialState = {};

const eventsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ALL_EVENTS: {
      const allEvents = {};
      action.events.forEach((event) => {
        allEvents[event.id] = event;
      });
      return {
        ...state,
        allEvents: action.Events,
      };
    }
    case LOAD_GROUP_EVENTS: {
      const allGroupEvents = {};
      action.events.forEach((event) => {
        allGroupEvents[event.id] = event;
      });
      return {
        ...state,
        allGroupEvents: action.events,
      };
    }
    default:
      return state;
  }
};

export default eventsReducer;
