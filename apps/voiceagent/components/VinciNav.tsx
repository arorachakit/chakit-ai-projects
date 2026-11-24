/* The thevincilabs.com top nav, so this demo reads as part of the site. Styles live in @chakit/config/neural.css. */
export default function VinciNav() {
  return (
    <header className="nr-nav nr-gut">
      <a href="https://thevincilabs.com" aria-label="The Vinci Labs, home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-white.png" alt="The Vinci Labs" width="811" height="127" />
      </a>
      <nav aria-label="Primary">
        <a href="https://thevincilabs.com/#systems">All systems</a>
        <a className="nr-cta" href="https://thevincilabs.com/#contact">Start a project</a>
      </nav>
    </header>
  );
}
