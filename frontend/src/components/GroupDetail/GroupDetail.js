import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getGroupDetail } from "../../store/groups";
import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import EventsByGroup from "../EventsByGroup/EventsByGroup";
import { getGroupEvents } from "../../store/events";
import DeleteGroupModal from "../DeleteGroupsEventsModal/DeleteGroupModal";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import "./groupDetail.css";

function GroupDetail() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { groupId } = useParams();
  const sessionUser = useSelector((state) => state.session.user);
  const currentGroupEvents = useSelector(
    (state) => state.events.allGroupEvents
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      dispatch(getGroupDetail(parseInt(groupId)))
        .then((groupId) => getGroupEvents(groupId))
        .then(() => setIsLoading(false));
    }
  }, [dispatch, groupId, currentGroupEvents]);

  const group = useSelector((state) => state.groups.currentGroup);

  // const events = useSelector((state) =)

  // if (currentGroupEvents === null || undefined) {
  //   numOfEvents = 0;

  // } else {
  //   numOfEvents = Object.keys(currentGroupEvents).length;
  // }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  let isLoggedIn = false;
  if (sessionUser) isLoggedIn = !isLoggedIn;
  const isOrganizer = isLoggedIn && sessionUser?.id === group.Organizer.id;

  let numOfEvents = group.Events.length;
  console.log(currentGroupEvents);

  const previewImage = group.GroupImages.find(
    (image) => image.preview === true
  );

  const navigateToCreateEvent = (groupId) => {
    history.push({
      pathname: `/groups/${groupId}/events/new`,
      state: { group: group },
    });
  };

  const navigateToUpdateGroup = (groupId) => {
    history.push({
      pathname: `/groups/${groupId}/update`,
      state: { group: group },
    });
  };

  return (
    <div className='main-group-div'>
      <div className='breadcrumbLinkGroups'>
        <p>&larr;</p>
        <Link to='/groups'>Groups</Link>
      </div>
      <div className='upper-group-details'>
        <div className='group-detail-thumbnail-div'>
          <img
            className='group-detail-thumbnail'
            src={previewImage.url}
            alt=' '
          />
        </div>
        <div className='group-detail-content'>
          <div className='group-detail-name'>
            <h3>{group.name}</h3>
          </div>
          <div className='group-detail-location'>{group.city}</div>
          <div className='group-detail-events'>
            {numOfEvents === 0 ? 0 : numOfEvents} Event
            {numOfEvents === 1 ? null : "s"}
            <span className='group-detail-dot'>·</span>
            <span className='group-detail-privacy'>
              {group.isPrivate ? "Private" : "Public"}
            </span>
          </div>
          <div className='group-detail-organized-by'>
            <h5>
              Organized by {group.Organizer.firstName}{" "}
              {group.Organizer.lastName}
            </h5>
          </div>
          {isLoggedIn && !isOrganizer ? (
            <button
              className='group-detail-join'
              onClick={() => alert("Feature Coming Soon")}
            >
              Join this group
            </button>
          ) : (
            <></>
          )}
          {isOrganizer && (
            <div className='organizer-buttons'>
              <button
                onClick={() => navigateToCreateEvent(group.id)}
                className='group-detail-create'
              >
                Create event
              </button>
              <button
                onClick={() => navigateToUpdateGroup(group.id)}
                className='group-detail-update'
              >
                Update
              </button>
              <OpenModalButton
                className='group-detail-delete'
                buttonText='Delete'
                modalComponent={<DeleteGroupModal />}
              />
            </div>
          )}
        </div>
      </div>
      <div className='lower-group-details'>
        <h4 className='group-detail-organized-by upper'>Organizer</h4>
        <h5 className='group-detail-organized-by lower'>
          {group.Organizer.firstName} {group.Organizer.lastName}
        </h5>
        <h3 className='group-about-title'>What we're about</h3>
        <p className='group-about'> {group.about}</p>
        <EventsByGroup groupId={group.id} />
      </div>
    </div>
  );
}

export default GroupDetail;
