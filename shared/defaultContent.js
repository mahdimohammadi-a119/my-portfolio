// Default content. This mirrors the text that was hardcoded in the original
// portfolio, so the site looks exactly the same before anything is edited.
export const defaultContent = {
  meta: {
    title: "mahdi-portfolio",
  },

  navbar: {
    logo: "Time To Program",
    links: [
      { label: "Home", href: "#home" },
      { label: "Skills", href: "#skills" },
      { label: "About Me", href: "#about" },
      { label: "Projects", href: "#projects" },
      { label: "Contact", href: "#contact" },
    ],
    ctaLabel: "Contact Me",
    ctaHref: "#contact",
  },

  hero: {
    greeting: "Hi, I'm Mahdi",
    title: "Front-End Developer",
    description:
      "I'm a Junior Front-End Developer passionate about building clean, responsive, and user-friendly websites. I work with HTML, CSS, JavaScript, and React to create modern web interfaces. I'm always learning new skills, improving my code, and building projects to grow as a developer.",
    primaryButton: { label: "View My Work", href: "#projects" },
    secondaryButton: { label: "Contact Me", href: "#contact" },
    image: "/hero.jpg",
    imageAlt: "Developer illustration",
  },

  about: {
    image: "/hero.jpg",
    imageAlt: "About me",
    heading: "About Me",
    paragraphs: [
      "I'm a motivated Junior Front-End Developer who enjoys turning ideas into websites. I focus on writing clean code, creating responsive designs, and learning modern web technologies. I'm looking for opportunities to improve my skills and gain real-world experience.",
      "My journey in web development is just beginning. Every project helps me improve my skills, learn new things, and become a better developer.",
    ],
    button: { label: "Explore My Projects", href: "#projects" },
  },

  skills: {
    heading: "My Skills",
    description: "Technologies I'm learning and using to build modern websites.",
    items: [
      { name: "HTML", description: "Page structure", image: "/HTML.png" },
      { name: "CSS", description: "Design and layout", image: "/CSS.png" },
      { name: "JavaScript", description: "Interactive websites", image: "/JavaScript.png" },
      { name: "React", description: "Reusable components", image: "/React.png" },
    ],
  },

  projects: {
    heading: "My Projects",
    description: "Some of the projects I've built while learning frontend development.",
    items: [
      { id: "project-1", title: "Study Planner", description: "A modern website for study planning.", image: "/project1.jpg", alt: "Study Planner website" },
      { id: "project-2", title: "Tech Store", description: "A modern digital product catalog.", image: "/project2.jpg", alt: "Tech Store website" },
      { id: "project-3", title: "Dynamic Input Fields", description: "An interactive form builder.", image: "/project3.jpg", alt: "Dynamic Input Fields" },
      { id: "project-4", title: "Simple Form Validation", description: "A responsive form with email and password validation.", image: "/project4.jpg", alt: "Simple Form Validation" },
      { id: "project-5", title: "My To-Do List", description: "Organize daily tasks and stay on schedule.", image: "/project5.jpg", alt: "To-Do List website" },
      { id: "project-6", title: "Dice Roller", description: "Generate a random number from 1 to 6.", image: "/project6.jpg", alt: "Dice Roller" },
    ],
  },

  contact: {
    heading: "Contact Me",
    description: "Have a project in mind? Let's create something amazing together.",
    details: [
      { icon: "✉", label: "Email", value: "MahdiMohammadi119m@gmail.com" },
      { icon: "⌕", label: "Location", value: "Herat, Afghanistan" },
      { icon: "↗", label: "Portfolio", value: "Frontend Developer" },
    ],
    form: {
      namePlaceholder: "Full Name",
      emailPlaceholder: "Email Address",
      messagePlaceholder: "Your Message",
      submitLabel: "Send Message",
    },
  },

  footer: {
    madeWith: "Made with by Mahdi",
    backToTopLabel: "Back to Top ↑",
    copyright: "© 2026 All Rights Reserved",
  },
};
