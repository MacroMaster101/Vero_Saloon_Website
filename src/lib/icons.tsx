import type { ReactNode } from 'react';

// Service icons ported from the reference booking JS. Inline 24x24 SVGs that
// inherit colour via stroke=currentColor so they work in both choice states.
const wrap = (children: ReactNode): ReactNode => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const serviceIcons: Record<string, ReactNode> = {
  scissors: wrap(
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </>,
  ),
  razor: wrap(
    <>
      <path d="M14 4l6 6" />
      <path d="M4 20l8-8" />
      <path d="M14 4l4-1 3 3-1 4z" />
      <path d="M12 12l-2 2" />
    </>,
  ),
  beard: wrap(
    <>
      <path d="M5 5v4a7 7 0 0014 0V5" />
      <path d="M5 9c2 5 4 7 7 7s5-2 7-7" />
      <path d="M9 4v2M15 4v2" />
    </>,
  ),
  star: wrap(
    <polygon points="12 2 15 9 22 9.3 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9.3 9 9" />,
  ),
  color: wrap(
    <>
      <path d="M9 11l-6 6a2 2 0 003 3l6-6" />
      <path d="M14 7l3 3" />
      <path d="M12 9l5-5a2.8 2.8 0 014 4l-5 5z" />
    </>,
  ),
  beauty: wrap(
    <>
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
      <path d="M18 14l.8 2L21 17l-2.2.9L18 20l-.8-2.1L15 17l2.2-1z" />
    </>,
  ),
};

export function serviceIcon(name: string): ReactNode {
  return serviceIcons[name] ?? serviceIcons.scissors;
}
