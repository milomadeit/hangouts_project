import { useDispatch, useSelector } from "react-redux";
import { getGroupDetail } from "../../store/groups";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import EventsByGroup from "../EventsByGroup/EventsByGroup";

function GroupDetail() {
  const dispatch = useDispatch();
  const { groupId } = useParams();

  useEffect(() => {
    if (groupId) {
      dispatch(getGroupDetail(parseInt(groupId)));
    }
  }, [dispatch, groupId]); // Ensure that the effect is dependent on groupId as well.

  const group = useSelector((state) => state.groups.currentGroup);

  // If the group data is not yet available, you can return a loading indicator or null
  if (!group) {
    return <div>Loading group details...</div>;
  }

  return (
    <div>
      <div className='group-thumbnail-div'>
        <img className='group-thumbnail' src={group.previewImage} alt=' ' />
      </div>
      <div className='group-content'>
        <div className='group-name'>{group.name}</div>
        <div className='group-location'>{group.city}</div>
        <div className='group-description'>{group.about}</div>
        <div className='group-events'>
          {group.eventCount} Event{group.eventCount === 1 ? null : "s"}
          <span className='group-dot'>·</span>
          <span className='group-privacy'>
            {group.isPrivate ? "Private" : "Public"}
          </span>
        </div>
        <div>
          Orangized by {group.Organizer.firstName} {group.Organizer.lastName}
        </div>
        <button> Join this group</button>
      </div>
      <div>
        <h4>Organizer</h4>
        <h6>
          {group.Organizer.firstName} {group.Organizer.lastName}
        </h6>

        <h4>What we're about</h4>
        <p>{group.about}</p>
        <EventsByGroup groupId={group.id
        } />
      </div>
    </div>
  );
}

export default GroupDetail;
