import { useContent } from "../context/ContentContext";

function Contact() {
  const { contact } = useContent();

  return (
    <section className="contact" id="contact">
      <div className="contact-heading">
        <h2>{contact.heading}</h2>
        <p>{contact.description}</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          {contact.details.map((detail, index) => (
            <div className="contact-item" key={index}>
              <span>{detail.icon}</span>
              <div>
                <h3>{detail.label}</h3>
                <p>{detail.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          className="contact-form"
          onSubmit={(event) => {
            // No backend for messages yet; stop the page from reloading and losing input.
            event.preventDefault();
          }}
        >
          <input type="text" placeholder={contact.form.namePlaceholder} required />
          <input type="email" placeholder={contact.form.emailPlaceholder} required />
          <textarea placeholder={contact.form.messagePlaceholder} rows="5" required></textarea>
          <button type="submit">{contact.form.submitLabel}</button>
        </form>
      </div>
    </section>
  );
}

export default Contact;
