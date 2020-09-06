import React from "react";
import { render } from "react-dom";

import Nav from "../components/Nav";

render(
  <>
    {/* <Nav /> */}
    <div className="container text-center">
      <h1>This is our homepage</h1>
      <a href="/login" className="get-started-button btn btn-outline-primary">Sign In to Get Started</a>

      <a href="/app" className="get-started-button btn btn-outline-dark">Or Clicke here to get to the <code>/app</code> (or the easter egg status 418 if you're not authenticated!) </a>
    </div>
  </>,
  document.getElementById('root')
)
