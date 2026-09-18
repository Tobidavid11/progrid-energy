import "./BlogHero.css";

export default function BlogHero() {
  return (
    <section className="blog-hero">
      <span className="blog-hero__kicker">Insights &amp; Updates</span>

      <h1 className="blog-hero__title">
        Ideas Powering
        <br />
        Every Project We Build
      </h1>

      <p className="blog-hero__subtitle">
        Guides, product deep-dives, and field notes from our engineering
        team — covering solar systems, backup power, and everything in
        between.
      </p>
    </section>
  );
}