import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route, Link } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation/Navigation";
import HomePage from "./components/HomePage/HomePage";
import Groups from "./components/AllGroups/AllGroups";
import GroupDetail from "./components/GroupDetail/GroupDetail";
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
              {/* should be components below*/}
              <Groups />
            </div>
          </Route>
          <Route exact path='/events'>
            <div className='linkEventGroup'>
              {/* should be components below*/}
              <h2>Groups</h2>
              <h2>Events</h2>
            </div>
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
