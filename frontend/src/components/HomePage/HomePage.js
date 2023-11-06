import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./homePage.css";

function HomePage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);

  return (
    <div className='linkEventGroup'>
      <Link className='groupsLink' to='/groups'>
        See All Groups
      </Link>
      <Link className='eventsLink' to='/events'>
        Find An Event
      </Link>
    </div>
  );
}

export default HomePage;
