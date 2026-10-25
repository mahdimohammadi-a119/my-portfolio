import { useState } from "react";
import { useContent } from "../context/ContentContext";

function Navbar() {
  const { navbar } = useContent();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <h2 className="logo">{navbar.logo}</h2>

      <div className={menuOpen ? "nav-links active" : "nav-links"}>
        {navbar.links.map((link, index) => (
          <a key={index} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
      </div>

      <a href={navbar.ctaHref} className="nav-cta">
        {navbar.ctaLabel}
      </a>

      <button
        className={menuOpen ? "menu-toggle open" : "menu-toggle"}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}

export default Navbar;
