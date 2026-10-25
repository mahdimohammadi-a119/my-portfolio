import { useContent } from "../context/ContentContext";

function Hero() {
  const { hero } = useContent();

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h3>{hero.greeting}</h3>

        <h1>{hero.title}</h1>

        <p>{hero.description}</p>

        <div className="hero-buttons">
          <a href={hero.primaryButton.href} className="btn-primary">
            {hero.primaryButton.label}
          </a>

          <a href={hero.secondaryButton.href} className="btn-secondary">
            {hero.secondaryButton.label}
          </a>
        </div>
      </div>

      <div className="hero-image">
        {hero.image && <img src={hero.image} alt={hero.imageAlt} />}
      </div>
    </section>
  );
}

export default Hero;
