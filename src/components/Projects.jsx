import { useState } from "react";
import { useContent } from "../context/ContentContext";

function Projects() {
  const { projects } = useContent();
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section className="projects" id="projects">
      <div className="projects-heading">
        <h2>{projects.heading}</h2>
        <p>{projects.description}</p>
      </div>

      <div className="projects-container">
        {projects.items.map((project) => (
          <div className="project-card" key={project.id}>
            {project.image && (
              <img
                src={project.image}
                alt={project.alt}
                onClick={() => setSelectedImage(project.image)}
              />
            )}

            <div className="project-info">
              <h3>{project.title}</h3>
              <p>{project.description}</p>

              <button className="view-project" onClick={() => setSelectedImage(project.image)}>
                View Project ↗
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <button
            className="modal-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image"
          >
            &times;
          </button>

          <img
            src={selectedImage}
            alt="Large project screenshot"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

export default Projects;
