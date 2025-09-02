import { ReactNode } from "react";
import './styles.scss';

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="container">
      {children}
    </div>
  );
}
