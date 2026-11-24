/* Toast */
import { CircleCheck, TriangleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

// A short line at the bottom after an action, above the tab bar, with an
// optional Undo. Gone after four seconds.
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((text, { tone = "good", undo } = {}) => {
    const id = Math.random();
    setItems((xs) => [...xs.slice(-2), { id, text, tone, undo }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[70] flex flex-col items-center gap-2 lg:bottom-6" aria-live="polite">
        {items.map((t) => (
          <p key={t.id} className="pointer-events-auto flex items-center gap-3 rounded-r-pill bg-ink py-2.5 pr-2.5 pl-4 text-sm text-white shadow-sh-3">
            {t.tone === "bad" ? <TriangleAlert className="size-4 text-clay-400" aria-hidden="true" /> : <CircleCheck className="size-4 text-sage-400" aria-hidden="true" />}
            {t.text}
            {t.undo && (
              <button
                type="button"
                onClick={() => {
                  t.undo();
                  setItems((xs) => xs.filter((x) => x.id !== t.id));
                }}
                className="rounded-r-pill px-3 py-1 font-semibold text-clay-200 hover:bg-white/10"
              >
                Undo
              </button>
            )}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
