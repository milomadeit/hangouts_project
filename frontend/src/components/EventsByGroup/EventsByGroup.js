import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGroupEvents } from "../../store/events";
import { useHistory } from "react-router-dom";

import "./eventsByGroup.css";

function EventsByGroup({ groupId }) {
  const dispatch = useDispatch();
  const today = new Date();
  const history = useHistory();
  const events = useSelector((state) => state.events.allGroupEvents);
  const currGroup = useSelector((state) => state.groups.currentGroup);

  useEffect(() => {
    if (groupId) {
      dispatch(getGroupEvents(groupId));
    }
  }, [dispatch, groupId]); // Add groupId to the dependency array.

  if (!events || !groupId) {
    return <div>Loading...</div>;
  }

  const navigateToEvent = (eventId) => {
    history.push(`/events/${eventId}`);
  };

  // Convert the events object into an array of events
  const eventsArray = Object.values(events);
  eventsArray.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const pastEvents = eventsArray.filter((event) => {
    return new Date(event.startDate) < today;
  });

  const futureEvents = eventsArray.filter((event) => {
    return new Date(event.startDate) > today;
  });
  return (
    <section className='events-for-group'>
      {futureEvents.length > 0 ? (
        <div>
          <h4 className='upcoming events'>
            Upcoming Events ({futureEvents.length})
          </h4>
          <ul className='events-ul'>
            {futureEvents.map((event) => (
              <li
                onClick={() => navigateToEvent(event.id)}
                className='event-item-group'
                key={event.id}
              >
                <div className='event-thumbnail-div'>
                  <img
                    className='event-thumbnail-group'
                    src={event.previewImage}
                    alt=' '
                  />
                </div>
                <div className='event-date-time-group'>
                  {event.startDate.slice(0, 10)}
                  <span className='group-dot'>·</span>
                  {event.startDate.slice(11, 16)}
                </div>
                <div>
                  <h5 className='event-name-group'>{event.name}</h5>
                  <h6 className='event-location-group'>
                    {event.Group.city}, {event.Group.state}
                  </h6>
                </div>
                <div className='event-description-group'>
                  <p className="event-description-p">
                    {event.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <h4 className='noupcoming events'>No Upcoming Events</h4>
      )}
      {pastEvents.length > 0 ? (
        <div>
          <h4 className='past events'>Past Events ({pastEvents.length})</h4>
          <ul>
            {pastEvents.map((event) => (
              <li
                onClick={() => navigateToEvent(event.id)}
                className='event-item-group'
                key={event.id}
              >
                <div className='event-thumbnail-group'>
                  <img src={event.previewImage} alt=' ' />
                </div>
                <div>
                  {event.startDate.slice(0, 10)}
                  <span className='group-dot'>·</span>
                  {event.startDate.slice(11, 17)}
                </div>
                <div>
                  <h5>{event.name}</h5>
                  <h6>
                    {event.Venue.city}, {event.Venue.state}
                  </h6>
                </div>
                <div>
                  <p>
                    An event for {currGroup.name} at {event.Venue.address}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <h4 className='nopast events'>No Past Events</h4>
      )}
    </section>
  );
}

export default EventsByGroup;
