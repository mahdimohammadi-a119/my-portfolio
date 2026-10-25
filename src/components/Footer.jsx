import { useContent } from "../context/ContentContext";

function Footer() {
  const { footer } = useContent();

  return (
    <footer className="footer">
      <p>{footer.madeWith}</p>

      <a href="#home">{footer.backToTopLabel}</a>

      <span>{footer.copyright}</span>

      <a href="/admin" className="footer-admin-link">Admin</a>
    </footer>
  );
}

export default Footer;
