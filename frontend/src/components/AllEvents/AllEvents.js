import { useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./allEvents.css";
import { getEvents } from "../../store/events";

function Events() {
  const history = useHistory();
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.allEvents);
  const user = useSelector((state) => state.session.user);
  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch, user, events]);

  const eventList = events ? Object.values(events) : [];

  // Sorts the events by startDate in ascending order (chronologically)
  eventList.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const handleEventClick = (eventId) => {
    history.push(`/events/${eventId}`);
  };



  return (
    <section className='eventsSection'>
      <div className='event-list-header'>
        <Link
          className='allEventsActive'
          to='/events'
          onClick={(e) => e.preventDefault()}
        >
          Events
        </Link>
        <Link className='allGroupsNotActive' to='/groups'>
          Groups
        </Link>
      </div>
      <h5 className='event-caption'>Events in Meetup</h5>
      {events ? (
        <ul className='allEventsSection'>
          {eventList.map((event) => (
            <li
              onClick={() => handleEventClick(event.id)}
              className='event-item'
              key={event.id}
            >
              <div className='event-thumbnail-div'>
                <img
                  className='event-thumbnail'
                  src={event.previewImage}
                  alt=' '
                />
              </div>
              <div className='event-content'>
                <div>
                  {event.startDate.slice(0, 10)}
                  <span className='group-dot'>·</span>
                  {event.startDate.slice(11, 16)}
                </div>
                <div className='event-name'>{event.name}</div>
                <div className='event-location'>
                  {event.Group?.city}, {event.Group?.state}
                </div>
                <div className='event-description-group'>
                  <p>A member only event for {event.name}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className='event-caption'>Loading...</p>
      )}
    </section>
  );
}

export default Events;
