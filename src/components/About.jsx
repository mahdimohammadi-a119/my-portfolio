import { useContent } from "../context/ContentContext";

function About() {
  const { about } = useContent();

  return (
    <section className="about" id="about">
      <div className="about-image">
        {about.image && <img src={about.image} alt={about.imageAlt} />}
      </div>

      <div className="about-content">
        <h2>{about.heading}</h2>

        {about.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}

        <a href={about.button.href} className="about-button">
          {about.button.label}
        </a>
      </div>
    </section>
  );
}

export default About;
