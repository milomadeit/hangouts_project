import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import SignupFormModal from "../SignUpFormModal/SignupFormModal";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import "./homePage.css";
import DESKS from "../../images/DESKS.png";
function HomePage() {
  const sessionUser = useSelector((state) => state.session.user);

  return (
    <div className='homePage'>
      <section className='section1'>
        <div className='hpDiv'>
          <h1>Find a hangout or create one!</h1>
          <h4>We're bringing people and communities together digitally.</h4>
        </div>
        <img className='infoGraphic' src={DESKS} alt='' />
      </section>
      <section className='section2'>
        <h3>How Hangouts Work</h3>
        <p className='hpCaption'>
          Find groups and browse events. To join a group or attend an event sign
          up and create a user profile then request to join the group you'd like
          to be a part of or create your own.
        </p>
      </section>
      <section className='section3'>
        <div className='column A'>
          <Link className='groupsLink' to='/groups'>
            See All Groups
          </Link>
          <p className='linkCaption'>Find a group</p>
        </div>
        <div className='column'>
          <Link className='eventsLink' to='/events'>
            Find An Event
          </Link>
          <p className='linkCaption'>Join a community to attend</p>
        </div>
        <div className='column'>
          {sessionUser ? (
            <>
              <Link className='newGroupLink' to='/groups/new'>
                Start A New Group
              </Link>
              <p className='linkCaption'>Join today to create a group</p>
            </>
          ) : (
            <>
              <span className='disabledNewGroupLink'>Start A New Group</span>
              <p className='linkCaption'>Join today to create a group </p>
            </>
          )}
        </div>
      </section>
      {!sessionUser && (
        <section className='section4'>
          <OpenModalButton
            className='joinButton'
            buttonText='Come Hangout'
            modalComponent={<SignupFormModal />}
          />
        </section>
      )}
    </div>
  );
}

export default HomePage;
