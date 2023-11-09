import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEventDetail } from "../../store/events";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import "./eventDetail.css";
import { getAllAttendees } from "../../store/events";
import { getGroupDetail } from "../../store/groups";

function EventDetail() {
  const dispatch = useDispatch();
  const { eventId } = useParams();
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => {
    if (eventId) {
      dispatch(getEventDetail(parseInt(eventId)));
      dispatch(getAllAttendees(parseInt(eventId)));
    }
  }, [dispatch, eventId]);

  const event = useSelector((state) => state.events.currentEvent);
  const attendees = useSelector((state) => state.events.Attendees);

  useEffect(() => {
    if (event && event.Group && event.Group.id) {
      dispatch(getGroupDetail(event.Group.id));
    }
  }, [dispatch, event]);

  const group = useSelector((state) => state.groups.currentGroup);

  if (!event || !attendees) {
    return <div>Loading...</div>;
  }

  if (!group) {
    return <div>Loading...</div>;
  }

  const host = attendees.find((attendee) => (attendee.status = "host"));

  if (sessionUser.id === event.hostId) {
  }

  return (
    <div className=''>
      <div className='event-detail-top'>
        <div className='breadcrumbLinkEvents'>
          <p>&larr;</p>
          <Link to='/events'>Events</Link>
        </div>
        <div className='event-detail-name'>
          <h3>{event.name}</h3>
        </div>
        <div className='group-info-organizer'>
          <h5>
            Hosted by {host.firstName} {host.lastName}
          </h5>
        </div>
      </div>
      <div className='background-div-color'>
        <div className='upper-event-details'>
          <div className='event-image-thumbnail-div'>
            <img
              className='event-image-thumbnail'
              src={event.previewImage}
              alt=' '
            />
          </div>
          <div className='cards-div'>
            <div className='group-info-div'>
              <img
                className='group-detail-image'
                src={group.previewImage}
                alt=' '
              />
              <div className='group-detail-info'>
                <h4 className='group-detail-name'>{group.name}</h4>
                <h6 className='group-detail-privacy'>
                  {group.isPrivate ? "Private" : "Public"}
                </h6>
              </div>
            </div>
            <div className='event-info-card'>
              <div className='event-info-div'>
                <p>
                  Start {event.startDate.slice(0, 10)}{" "}
                  <span className='group-dot'>·</span>{" "}
                  {event.startDate.slice(11, 16)}
                </p>
                <p>
                  End {event.endDate.slice(0, 10)}{" "}
                  <span className='group-dot'>·</span>{" "}
                  {event.endDate.slice(11, 16)}
                </p>
                <p>Price: ${event.price}</p>
                <p>{event.type}</p>
                <div className='update-delete-buttons'>
                  <button className="event-detail-update">Update</button>
                  <button className="event-detail-delete">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='event-detail-description'>
          <h3>Details</h3>
          <p>{event.description}</p>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
