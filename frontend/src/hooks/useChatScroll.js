import { useEffect, useRef } from "react";

export function useChatScroll(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, deps); // eslint-disable-line
  return ref;
}
