/* Notices */
import { CircleCheck, TriangleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

// Short confirmations after a save, bottom right, gone after four seconds.
const NoticeContext = createContext(() => {});

export function NoticeProvider({ children }) {
  const [items, setItems] = useState([]);
  const notify = useCallback((text, tone = "good") => {
    const id = Math.random();
    setItems((xs) => [...xs, { id, text, tone }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <NoticeContext.Provider value={notify}>
      {children}
      <div className="fixed right-4 bottom-4 z-[60] space-y-2" aria-live="polite">
        {items.map((n) => (
          <p key={n.id} className="flex items-center gap-2 rounded-r-md bg-ink px-4 py-3 text-sm text-white shadow-sh-3">
            {n.tone === "bad" ? (
              <TriangleAlert className="size-4 text-clay-400" aria-hidden="true" />
            ) : (
              <CircleCheck className="size-4 text-sage-400" aria-hidden="true" />
            )}
            {n.text}
          </p>
        ))}
      </div>
    </NoticeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotify = () => useContext(NoticeContext);
