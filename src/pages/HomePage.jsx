import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <h1>See Halifax as it was.</h1>
        <p className="lead">
          Explore historical photos of Halifax and the surrounding area, pinned
          to the spots where they were taken. Stand on a corner, open the map,
          and see what was there decades ago.
        </p>
        <div className="hero-actions">
          <Link to="/map" className="button button--primary">Open the map</Link>
          <Link to="/contribute" className="button">Share a photo</Link>
        </div>
      </section>

      <section className="features">
        <article>
          <h2>Pinned to the street</h2>
          <p>Every photo sits on the map where it was taken, with its year and source.</p>
        </article>
        <article>
          <h2>Then and now</h2>
          <p>Compare an old photo with today's view of the same spot.</p>
        </article>
        <article>
          <h2>Built from public archives</h2>
          <p>Photos come from sources like the Halifax Municipal Archives, always credited and linked.</p>
        </article>
      </section>


    </div>
  )
}
