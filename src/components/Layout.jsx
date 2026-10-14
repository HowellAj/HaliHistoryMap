import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { SITE_NAME, CONTACT_EMAIL } from '../config.js'

export default function Layout() {
  const { pathname } = useLocation()
  const isMap = pathname === '/map'

  return (
    <div className={`app ${isMap ? 'app--fullbleed' : ''}`}>
      <header className="site-header">
        <NavLink to="/" className="brand">{SITE_NAME}</NavLink>
        <nav className="site-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/map">Map</NavLink>
          <NavLink to="/contribute">Contribute</NavLink>
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      {!isMap && (
        <footer className="site-footer">
          <p>
            Photos are credited to and linked from their original sources.
            To request removal of an item, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
          <p>Map data © OpenStreetMap contributors.</p>
        </footer>
      )}
    </div>
  )
}
