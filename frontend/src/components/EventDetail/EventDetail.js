import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEventDetail } from "../../store/events";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAllAttendees } from "../../store/events";
import { getGroupDetail } from "../../store/groups";
import DeleteEvent from "../DeleteGroupsEventsModal/DeleteEventModal";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import "./eventDetail.css";

function EventDetail() {
  const dispatch = useDispatch();
  const history = useHistory();
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

  const previewImageGroup = group.GroupImages.find(
    (image) => image.preview === true
  );

  const previewImageEvent = event.EventImages.find(
    (image) => image.preview === true
  );

  const host = attendees.find((attendee) => (attendee.status = "host"));

  let isCreator = false;
  if (sessionUser) {
    if (sessionUser.id === event.hostId) {
      isCreator = !isCreator;
    }
  }

  const goToGroup = (groupId) => {
    history.push(`/groups/${groupId}`);
  };

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
              src={previewImageEvent?.url}
              alt=' '
            />
          </div>
          <div className='cards-div'>
            <div className='group-info-div'>
              <img
                className='group-detail-image'
                src={previewImageGroup.url}
                alt=' '
              />
              <div
                className='group-detail-info'
                onClick={() => goToGroup(group.id)}
              >
                <h4 className='group-detail-name'>{group.name}</h4>
                <h6 className='group-detail-privacy'>
                  {group.private ? "Private" : "Public"}
                </h6>
              </div>
            </div>
            <div className='event-info-card'>
              <div className='event-info-div'>
                <p className='event-info-div-time-start'>
                  <i id='clock' className='fa-solid fa-clock'>
                    {""} START
                  </i>
                  {"     "}
                  {event.startDate.slice(0, 10)}{" "}
                  <span className='group-dot'>·</span>{" "}
                  {event.startDate.slice(11, 16)}
                </p>
                <p className='event-info-div-time-end'>
                  <i id='clock' className='fa-solid fa-clock'>
                    {" "}
                    END
                  </i>
                  {"    "}
                  <p className='event-info-p-time-end'>
                    {event.endDate.slice(0, 10)}
                    <span className='group-dot'>·</span>
                    {""}
                    {event.endDate.slice(11, 16)}
                  </p>
                </p>
                <p className='event-info-div-price'>
                  <i id='dollar' className='fa-thin fa-dollar-sign'>
                    {" "}
                    {event.price > 0 ? `${event.price}` : "FREE"}
                  </i>{" "}
                </p>
                <p className='event-info-div-pin'>
                  <i id='pin' class='fa-solid fa-map-pin'></i> {event.type}
                </p>
                {isCreator && (
                  <div className='update-delete-buttons'>
                    <button className='event-detail-update'>Update</button>
                    <OpenModalButton
                      className='event-detail-delete'
                      buttonText='Delete'
                      modalComponent={<DeleteEvent />}
                    />
                  </div>
                )}
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
