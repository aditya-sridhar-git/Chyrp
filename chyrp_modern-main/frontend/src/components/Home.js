// frontend/src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="hero">
      <div className="container">
        <h1>Share Your Story With The World</h1>
        <p>A modern blogging platform where you can express your thoughts, ideas, and creativity.</p>
        <div>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
          <Link to="/login" className="btn btn-secondary" style={{marginLeft: '1rem'}}>Sign In</Link>
        </div>
      </div>
    </section>
  );
};

export default Home;