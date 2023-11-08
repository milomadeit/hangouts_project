import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGroupEvents } from "../../store/events";

function EventsByGroup({ groupId }) {
  const dispatch = useDispatch();
  const today = new Date();
  const events = useSelector((state) => state.events.allGroupEvents);
  const currGroup = useSelector((state) => state.groups.currentGroup);

  useEffect(() => {
    dispatch(getGroupEvents(groupId));
  }, [dispatch]);

  if (!events) {
    return <div>Loading group details...</div>;
  }

  const pastEvents = events.filter((event) => {
    return new Date(event.startDate) < today;
  });
  const futureEvents = events.filter((event) => {
    return new Date(event.startDate) > today;
  });
  return (
    <section>
      {futureEvents.length ? (
        <div>
          <h3>Upcoming Events ({futureEvents.length})</h3>
          <ul>
            {futureEvents.map((event) => (
              <li key={event.id}>
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
        <h3>No Upcoming Events</h3>
      )}
      {pastEvents.length ? (
        <div>
          <h3>Past Events ({pastEvents.length})</h3>
        </div>
      ) : (
        <h3>No Past Events</h3>
      )}
    </section>
  );
}

export default EventsByGroup;
