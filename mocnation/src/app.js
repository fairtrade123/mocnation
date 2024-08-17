import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios';
import BuildPlanDetails from './components/BuildPlanDetails';
import ImageUpload from './components/ImageUpload';
import ThreeDDesign from './components/ThreeDDesign';

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Browse Build Plans</Link>
            </li>
            <li>
              <Link to="/upload">Upload Image</Link>
            </li>
            <li>
              <Link to="/design">3D Design</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/buildplans/:id">
            <BuildPlanDetails />
          </Route>
          <Route path="/upload">
            <ImageUpload />
          </Route>
          <Route path="/design">
            <ThreeDDesign />
          </Route>
          <Route path="/">
            <BuildPlanBrowser />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

const BuildPlanBrowser = () => {
  const [buildPlans, setBuildPlans] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    const fetchBuildPlans = async () => {
      try {
        const response = await axios.get('/api/buildplans');
        setBuildPlans(response.data);
      } catch (error) {
        console.error('Error fetching build plans:', error);
      }
    };

    fetchBuildPlans();
  }, []);

  const filteredBuildPlans = buildPlans.filter(plan => {
    const titleMatch = plan.title.toLowerCase().includes(searchTitle.toLowerCase());
    const descriptionMatch = plan.description.toLowerCase().includes(searchDescription.toLowerCase());
    const userMatch = plan.user.username.toLowerCase().includes(searchUser.toLowerCase());
    return titleMatch && descriptionMatch && userMatch;
  });

  return (
    <div>
      <h2>Browse Build Plans</h2>
      <div>
        <label htmlFor="search-title">Title:</label>
        <input
          type="text"
          id="search-title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="search-description">Description:</label>
        <input
          type="text"
          id="search-description"
          value={searchDescription}
          onChange={(e) => setSearchDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="search-user">User:</label>
        <input
          type="text"
          id="search-user"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
      </div>
      <ul>
        {filteredBuildPlans.map((plan) => (
          <li key={plan._id}>
            <Link to={`/buildplans/${plan._id}`}>{plan.title}</Link>
            <p>{plan.description}</p>
            {plan.images.length > 0 && (
              <img src={plan.images[0]} alt={plan.title} style={{ maxWidth: '200px' }} />
            )}
            <p>Created by: {plan.user.username}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;