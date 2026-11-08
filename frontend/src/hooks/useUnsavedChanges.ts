import { useEffect } from "react";
import { useBlocker } from "react-router";

export function useUnsavedChanges(
  isDirty: boolean,
  message = "You have unsaved changes. Leave anyway?",
) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (confirm(message)) blocker.proceed();
    else blocker.reset();
  }, [blocker, message]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);
}
