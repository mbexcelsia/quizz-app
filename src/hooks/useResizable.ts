import { useCallback } from "react";

const useResizable = (
  ref: React.RefObject<HTMLElement>,
  direction: "height" | "width"
) => {
  const initResize = useCallback(() => {
    if (!ref.current) return;

    const element = ref.current;
    let startPos = 0;
    let startSize = 0;

    const startResize = (e: MouseEvent) => {
      startPos = direction === "height" ? e.clientY : e.clientX;
      startSize =
        direction === "height" ? element.offsetHeight : element.offsetWidth;
      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResize);
    };

    const resize = (e: MouseEvent) => {
      if (!element) return;

      const currentPos = direction === "height" ? e.clientY : e.clientX;
      const diff = currentPos - startPos;

      if (direction === "height") {
        element.style.height = `${startSize + diff}px`;
      } else {
        element.style.width = `${startSize + diff}px`;
      }
    };

    const stopResize = () => {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
    };

    const handle = document.createElement("div");
    handle.className = `resize-handle ${direction}`;
    element.appendChild(handle);
    handle.addEventListener("mousedown", startResize);

    return () => {
      handle.removeEventListener("mousedown", startResize);
      element.removeChild(handle);
    };
  }, [ref, direction]);

  return { initResize };
};

export default useResizable;
