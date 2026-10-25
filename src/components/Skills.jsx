import { useContent } from "../context/ContentContext";

function Skills() {
  const { skills } = useContent();

  return (
    <section className="skills" id="skills">
      <div className="section-heading">
        <h2>{skills.heading}</h2>
        <p>{skills.description}</p>
      </div>

      <div className="skills-container">
        {skills.items.map((item, index) => (
          <div className="skill-card" key={index}>
            {item.image && <img src={item.image} alt={`${item.name} logo`} />}
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;
