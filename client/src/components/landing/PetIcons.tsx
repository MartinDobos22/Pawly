import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: '1em',
  height: '1em',
  ...props,
});

function DogIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 9c0-3 1-4.5 2.6-4.5 1 0 1.6.6 2 1.5C10.3 5.7 11.1 5.5 12 5.5s1.7.2 2.4.5c.4-.9 1-1.5 2-1.5C20 4.5 19 6 19 9c0 .8.2 1.6-.1 2.6C17.9 15.5 15.3 18 12 18s-5.9-2.5-6.9-6.4C4.8 10.6 5 9.8 5 9Z" />
      <path d="M9.5 11.2h.01M14.5 11.2h.01" />
      <path d="M12 13.6v1.2" />
      <path d="M10.7 14.6c.4.5.8.7 1.3.7s.9-.2 1.3-.7" />
    </svg>
  );
}

function CatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 4.5 7.5 8h9L19 4.5V11c0 3.6-2.7 6.5-7 6.5S5 14.6 5 11V4.5Z" />
      <path d="M9.5 11h.01M14.5 11h.01" />
      <path d="M12 13v1.5M10.5 15.2l1.5.3 1.5-.3" />
      <path d="M6.5 13.5 4 14.5M17.5 13.5 20 14.5M6.7 15l-2 .8M17.3 15l2 .8" />
    </svg>
  );
}

function RabbitIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9.8 9.3C8.6 6.5 8.4 3.4 9.6 3.1c1.1-.3 1.7 2.7 1.8 5.3" />
      <path d="M14.2 9.3c1.2-2.8 1.4-5.9.2-6.2-1.1-.3-1.7 2.7-1.8 5.3" />
      <path d="M8.6 13a3.4 3.4 0 0 1 6.8 0c0 1.2-.6 2.2-1.5 2.8.9.5 1.4 1.2 1.4 2.2H8.7c0-1 .5-1.7 1.4-2.2-.9-.6-1.5-1.6-1.5-2.8Z" />
      <path d="M10.7 13h.01M13.3 13h.01" />
      <path d="M12 14.2v.6" />
    </svg>
  );
}

function RodentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="7" r="2" />
      <circle cx="16" cy="7" r="2" />
      <path d="M6.5 12c0-3 2.4-4.5 5.5-4.5S17.5 9 17.5 12c0 3.3-2.5 6-5.5 6s-5.5-2.7-5.5-6Z" />
      <path d="M11 12h.01M13 12h.01" />
      <path d="M12 13.5v1.2" />
      <path d="M5.5 16c-1.6 0-2.5 1-2.5 2.3" />
    </svg>
  );
}

function BirdIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.3 13.5a3.6 3.6 0 1 0 7.2 0 3.6 3.6 0 0 0-7.2 0Z" />
      <path d="M13.2 9.6a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M16.8 9 19.4 8.4 17.1 10.3" />
      <path d="M15 9h.01" />
      <path d="M7.5 12.3 4.6 11.5l1.8 2.2" />
      <path d="M9.6 16.7v1.4M11.8 16.9v1.4" />
      <path d="M9 14c1.3.7 2.7.7 4 0" />
    </svg>
  );
}

function ReptileIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 13c0-3 3-5.5 7-5.5s7 2.5 7 5.5-3 5.5-7 5.5S5 16 5 13Z" />
      <path d="M9 8.2 8 6M15 8.2 16 6M7 11l-2.5-1M17 11l2.5-1M7.5 15l-2 1.5M16.5 15l2 1.5" />
      <path d="M10 12.5h.01M14 12.5h.01" />
    </svg>
  );
}

function FishIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 12c2-3.5 5-5.3 8-5.3 3.3 0 6 2.3 7.3 5.3-1.3 3-4 5.3-7.3 5.3-3 0-6-1.8-8-5.3Z" />
      <path d="M18.8 12 22 8.5v7L18.8 12Z" />
      <path d="M14 9.5h.01" />
    </svg>
  );
}

function HorseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.5 17.5C6.5 14 7.5 11.5 9.5 9.8L9.3 7 11 4.5 12.5 7C15 7.6 16.5 9.8 16.5 12.5L16.5 18 9 18C8 18 7 18 6.5 17.5Z" />
      <path d="M12.5 7c-1 1-1.6 2.4-1.6 4" />
      <path d="M9.6 10.6h.01" />
      <path d="M8 15.2h.01" />
    </svg>
  );
}

export const PET_ICONS = [
  DogIcon,
  CatIcon,
  RabbitIcon,
  RodentIcon,
  BirdIcon,
  ReptileIcon,
  FishIcon,
  HorseIcon,
];
