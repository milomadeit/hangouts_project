import { useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./allGroups.css";
import { getGroups } from "../../store/groups";

function Groups() {
  const history = useHistory();
  const dispatch = useDispatch();
  const groups = useSelector((state) => state.groups.allGroups);
  const user = useSelector((state) => state.session.user);

  useEffect(() => {
    dispatch(getGroups());
  }, [dispatch, user]);

  // return values as an array
  const groupList = groups ? Object.values(groups) : [];

  const handleGroupClick = (groupId) => {
    history.push(`/groups/${groupId}`);
  };

  return (
    <section className='groupsSection'>
      <div className='group-list-header'>
        <Link className='allEvents' to='/events'>
          Events
        </Link>
        <Link
          className='allGroups'
          to='/groups'
          onClick={(e) => e.preventDefault()}
        >
          Groups
        </Link>
      </div>
      <h5 className='group-caption'>Groups in Meetup</h5>
      {groups ? (
        <ul className='allGroupsSection'>
          {groupList.map((group) => (
            <li
              onClick={() => handleGroupClick(group.id)}
              className='group-item'
              key={group.id}
            >
              <div className='group-thumbnail-div'>
                <img
                  className='group-thumbnail-small'
                  src={group.previewImage}
                  alt=' '
                />
              </div>
              <div className='group-content'>
                <div className='group-name'>{group.name}</div>
                <div className='group-location'>
                  {group.city}, {group.state}
                </div>
                <div className='group-description'>{group.about}</div>
                <div className='group-events'>
                  {group.eventCount} Event
                  {group.eventCount == 1 ? "" : "s"}
                  <span className='group-dot'>·</span>
                  <span className='group-privacy'>
                    {group.private ? "Private" : "Public"}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className='group-caption'>Loading groups...</p>
      )}
    </section>
  );
}

export default Groups;
