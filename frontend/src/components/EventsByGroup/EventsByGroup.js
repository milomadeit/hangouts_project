import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGroupEvents } from "../../store/events";
import "./eventsByGroup.css";

function EventsByGroup({ groupId }) {
  const dispatch = useDispatch();
  const today = new Date();
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

  const pastEvents = events.filter((event) => {
    return new Date(event.startDate) < today;
  });
  const futureEvents = events.filter((event) => {
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
              <li className='event-item' key={event.id}>
                <div className='event-thumbnail-div'>
                  <img
                    className='event-thumbnail'
                    src={event.previewImage}
                    alt=' '
                  />
                </div>
                <div className='event-date-time'>
                  {event.startDate.slice(0, 10)}
                  <span className='group-dot'>·</span>
                  {event.startDate.slice(11, 16)}
                </div>
                <div>
                  <h5 className='event-name'>{event.name}</h5>
                  <h6 className='event-location'>
                    {event.Venue.city}, {event.Venue.state}
                  </h6>
                </div>
                <div className='event-description'>
                  <p>
                    An event for {currGroup.name} at {event.Venue.address}
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
              <li className='event-item' key={event.id}>
                <div className='event-thumbnail'>
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
