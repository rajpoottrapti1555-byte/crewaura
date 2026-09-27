import React from "react";

export default function Hero({ onOpenModal }) { 
  const scrollToHow = () => { 
    document.getElementById("how")?.scrollIntoView(); 
  }; 
 
  return ( 
    <section className="hero" id="home"> 
      <div className="hero-content"> 
        <div className="tag">EVENT WORKFORCE PLATFORM</div> 
 
        <h1> 
          Build Your Event 
          <span>With the Right Crew.</span> 
        </h1> 
 
        <p> 
          CrewAura helps event organizers discover, hire and manage verified 
          event professionals — all from one platform. 
        </p> 
 
        <div className="hero-buttons"> 
          <button className="primary-btn" onClick={() => onOpenModal("signup")}> 
            Find Event Workers 
          </button> 
 
          <button className="secondary-btn" onClick={scrollToHow}> 
            How It Works 
          </button> 
        </div> 
      </div> 
 
      <div className="events-card"> 
        <div className="events-heading"> 
          <span>CREWAURA</span> 
          <h3>Events We Host</h3> 
          <p> 
            From intimate celebrations to large-scale productions, we help you 
            build the right event crew. 
          </p> 
        </div> 
 
        <div className="event-grid"> 
          <div className="event-item corporate"> 
            <div> 
              <h4>Corporate Events</h4> 
              <p>Conferences, meetings &amp; corporate gatherings</p> 
            </div> 
          </div> 
 
          <div className="event-item wedding"> 
            <div> 
              <h4>Weddings &amp; Celebrations</h4> 
              <p>Hospitality, coordination &amp; event support</p> 
            </div> 
          </div> 
 
          <div className="event-item concerts"> 
            <div> 
              <h4>Concerts &amp; Festivals</h4> 
              <p>Technical, backstage &amp; event crew</p> 
            </div> 
          </div> 
 
          <div className="event-item exhibition"> 
            <div> 
              <h4>Exhibitions &amp; Trade Shows</h4> 
              <p>Hosts, promoters &amp; support staff</p> 
            </div> 
          </div> 
 
          <div className="event-item sports"> 
            <div> 
              <h4>Sports Events</h4> 
              <p>Volunteers, coordinators &amp; ground staff</p> 
            </div> 
          </div> 
 
          <div className="event-item college"> 
            <div> 
              <h4>College &amp; Cultural Events</h4> 
              <p>Anchors, volunteers &amp; coordinators</p> 
            </div> 
          </div> 
        </div> 
      </div> 
    </section> 
  ); 
}