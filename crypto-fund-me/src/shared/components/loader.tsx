import { ReactNode } from "react";

export function Loader({
  isLoading = false,
  children,
  overlay = false,
}: {
  isLoading: boolean;
  children?: ReactNode;
  overlay?: boolean;
}) {
  const wrapperClass = overlay
    ? "screen-overlay"
    : "inline-flex justify-center w-[calc(1.5em+2rem)]";
  const dotClass = overlay ? " screen-overlay-dots" : "";

  if (isLoading) {
    return (
      <span className={`${wrapperClass}`}>
        <span className={`dot-flashing ${dotClass}`}></span>
      </span>
    );
  }

  return <>{children}</>;
}

export default Loader;
