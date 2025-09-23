import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <section className="landing">
      <h1>Welcome</h1>
      <p className="tagline">Fuck it we ball</p>

      {/* Team note / announcement */}
      <p className="team-note">
         focus for the demo is <strong>Landing → User Dashboard → Login/Sign up</strong>.
         Run test on local using npm run dev, make sure you cd to correct path.
         Please let me know of any changes such as libraries, additional pages/routes, certain css goals
        
      </p>

      <p className ="more-notes">
        TBD: Discuss any additional pages for site


      </p>

      <div className="cta">
        <Link className="btn" to="/">Button test but its blue :D</Link>
      </div>

      <ul className="quick-notes">
        <li>Pages live in <code>src/pages</code></li>
        <li>Routes are defined in <code>src/routes/AppRoutes.jsx</code></li>
        <li>Shared layout is in <code>src/layouts/MainLayout.jsx</code></li>
      </ul>
    </section>
  );
}