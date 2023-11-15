import { csrfFetch } from "./csrf";

const LOAD_ALL_EVENTS = "loadAllEvents/LOAD_ALL_EVENTS";
const LOAD_GROUP_EVENTS = "loadGroupEvents/LOAD_GROUP_EVENTS";
const GET_EVENT_DETAIL = "getEventDetail/GET_EVENT_DETAIL";
const GET_ALL_ATTENDEES = "getAllAttendees/GET_ALL_ATTENDEES";
const CREATE_EVENT = "createEvent/CREATE_EVENT";
const DELETE_EVENT = "deleteEvent/DELETE_EVENT";

const loadEvents = (events) => ({
  type: LOAD_ALL_EVENTS,
  events,
});

const loadGroupEvents = (events) => ({
  type: LOAD_GROUP_EVENTS,
  events,
});

const loadEventDetail = (event) => ({
  type: GET_EVENT_DETAIL,
  event,
});

const loadNewEvent = (event) => ({
  type: CREATE_EVENT,
  event,
});

const loadAttendees = (attendees) => ({
  type: GET_ALL_ATTENDEES,
  attendees,
});

const loadDeletedEvent = (eventId) => ({
  type: DELETE_EVENT,
  eventId,
});

export const getEvents = () => async (dispatch) => {
  const response = await csrfFetch("/api/events");

  if (response.ok) {
    const { Events } = await response.json();
    dispatch(loadEvents(Events));
    return Events;
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

export const getEventDetail = (eventId) => async (dispatch) => {
  const response = await csrfFetch(`/api/events/${eventId}`);

  if (response.ok) {
    const event = await response.json();
    dispatch(loadEventDetail(event));
    return event;
  }
  return response;
};

export const createEvent = (eventData, groupId) => async (dispatch) => {
  const response = await csrfFetch(`/api/groups/${groupId}/events`, {
    method: "POST",
    body: JSON.stringify(eventData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const event = await response.json();
    dispatch(loadNewEvent(event));
    dispatch(getEvents());
    return event;
  }

  const errorData = await response.json(); // Parse the JSON from the original response
  return errorData;
};

export const deleteEvent = (eventId) => async (dispatch) => {
  const response = await csrfFetch(`/api/events/${eventId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    const successMessage = await response.json();
    dispatch(loadDeletedEvent(eventId));
    return successMessage;
  }
  const errorData = await response.json();
  return errorData;
};

export const getAllAttendees = (eventId) => async (dispatch) => {
  const response = await csrfFetch(`/api/events/${eventId}/attendees`);

  if (response.ok) {
    const attendees = await response.json();
    dispatch(loadAttendees(attendees));
    return attendees;
  }
  const data = await response.json();

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
        allEvents,
      };
    }
    case LOAD_GROUP_EVENTS: {
      const allGroupEvents = {};
      action.events.forEach((event) => {
        allGroupEvents[event.id] = event;
      });
      return {
        ...state,
        allGroupEvents,
      };
    }
    case GET_EVENT_DETAIL: {
      return {
        ...state,
        currentEvent: action.event,
      };
    }
    case GET_ALL_ATTENDEES: {
      return {
        ...state,
        ...action.attendees,
      };
    }
    case CREATE_EVENT: {
      const newState = {
        ...state,
        allEvents: {
          ...state.allEvents,
          [action.event.id]: action.event,
        },
      };
      return newState;
    }
    case DELETE_EVENT: {
      const eventToDelete = action.eventId;

      // destructure the event to remove out of allEvents state
      const { [eventToDelete]: deletedEvent, ...remainingEvents } =
        state.allGroupEvents;

      return {
        ...state,
        allGroupEvents: remainingEvents,
      };
    }
    default:
      return state;
  }
};

export default eventsReducer;
