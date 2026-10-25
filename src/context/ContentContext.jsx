import { createContext, useContext, useEffect, useState } from "react";
import { defaultContent } from "../../shared/defaultContent.js";
import { fetchContent } from "../lib/api";

// The site renders the defaults immediately (identical to the original design),
// then swaps in the saved content as soon as the API responds.
const ContentContext = createContext(defaultContent);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    let cancelled = false;
    fetchContent()
      .then((data) => {
        if (!cancelled) setContent(data);
      })
      .catch(() => {
        /* API unavailable: keep the defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.title = content.meta.title;
  }, [content.meta.title]);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}
