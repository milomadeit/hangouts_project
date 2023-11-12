import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation/Navigation";
import HomePage from "./components/HomePage/HomePage";
import Groups from "./components/AllGroups/AllGroups";
import GroupDetail from "./components/GroupDetail/GroupDetail";
import Events from "./components/AllEvents/AllEvents";
import EventDetail from "./components/EventDetail/EventDetail";
import CreateGroup from "./components/CreateGroup/CreateGroup";
import CreateEvent from "./components/CreateEvent/CreateEvent";
import UpdateGroup from "./components/CreateGroup/UpdateGroup";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path='/'>
            <HomePage />
          </Route>
          <Route exact path='/groups'>
            <div className='linkEventGroup'>
              <Groups />
            </div>
          </Route>
          <Route exact path='/events'>
            <div className='linkEventGroup'>
              <Events />
            </div>
          </Route>
          <Route exact path='/events/:eventId'>
            <div className='EventDetails'>
              <EventDetail />
            </div>
          </Route>
          <Route path='/groups/new'>
            <CreateGroup />
          </Route>
          <Route path='/groups/:groupId/events/new'>
            <CreateEvent />
          </Route>
          <Route path='/groups/:groupId/update'>
            <UpdateGroup />
          </Route>
          <Route path='/groups/:groupId'>
            <GroupDetail />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;
