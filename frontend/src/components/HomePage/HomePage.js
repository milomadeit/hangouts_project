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
          <h4>We're bringing people and communities together digitally</h4>
        </div>
        <img className='infoGraphic' src={DESKS} alt='' />
      </section>
      <section className='section3'>
        <div className='column'>
          <Link className='groupsLink' to='/groups'>
            See All Groups
          </Link>
          {/* Caption for Groups */}
        </div>
        <div className='column'>
          <Link className='eventsLink' to='/events'>
            Find An Event
          </Link>
          {/* Caption for Events */}
        </div>
        <div className='column'>
          {sessionUser ? (
            <Link className='newGroupLink' to='/groups/new'>
              Start A New Group
            </Link>
          ) : (
            <span className='disabledNewGroupLink'>Start A New Group</span>
          )}
        </div>
      </section>
      <section className='section4'>
        <OpenModalButton
          className='joinButton'
          buttonText='Come Hangout'
          modalComponent={<SignupFormModal />}
        />
      </section>
    </div>
  );
}

export default HomePage;
