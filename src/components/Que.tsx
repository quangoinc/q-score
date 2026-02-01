import { SVGProps } from "react";

// Eye variations
const EYES = {
  normal: (
    <>
      <circle cx="280" cy="380" r="32" />
      <circle cx="520" cy="380" r="32" />
    </>
  ),
  wide: (
    <>
      <circle cx="250" cy="380" r="36" />
      <circle cx="550" cy="380" r="36" />
    </>
  ),
  happy: (
    <>
      <path d="M248,380 Q280,350 312,380" strokeWidth="28" strokeLinecap="round" fill="none" />
      <path d="M488,380 Q520,350 552,380" strokeWidth="28" strokeLinecap="round" fill="none" />
    </>
  ),
  winkLeft: (
    <>
      <path d="M248,380 Q280,350 312,380" strokeWidth="28" strokeLinecap="round" fill="none" />
      <circle cx="520" cy="380" r="32" />
    </>
  ),
  winkRight: (
    <>
      <circle cx="280" cy="380" r="32" />
      <path d="M488,380 Q520,350 552,380" strokeWidth="28" strokeLinecap="round" fill="none" />
    </>
  ),
  sleepy: (
    <>
      <ellipse cx="280" cy="385" rx="36" ry="20" />
      <ellipse cx="520" cy="385" rx="36" ry="20" />
    </>
  ),
};

// Mouth variations
const MOUTHS = {
  smile: (
    <path d="M320,520 Q400,600 480,520" strokeWidth="28" strokeLinecap="round" fill="none" />
  ),
  smallSmile: (
    <path d="M350,520 Q400,560 450,520" strokeWidth="24" strokeLinecap="round" fill="none" />
  ),
  grin: (
    <path d="M300,500 Q400,620 500,500" strokeWidth="28" strokeLinecap="round" fill="none" />
  ),
  open: (
    <ellipse cx="400" cy="540" rx="60" ry="45" />
  ),
  neutral: (
    <path d="M340,530 L460,530" strokeWidth="24" strokeLinecap="round" fill="none" />
  ),
  smirk: (
    <path d="M340,530 Q420,560 480,510" strokeWidth="24" strokeLinecap="round" fill="none" />
  ),
};

// Pre-defined face combinations
export const FACE_VARIANTS = [
  { eyes: "normal", mouth: "smile" },
  { eyes: "wide", mouth: "grin" },
  { eyes: "happy", mouth: "smallSmile" },
  { eyes: "winkLeft", mouth: "smirk" },
  { eyes: "winkRight", mouth: "smile" },
  { eyes: "normal", mouth: "open" },
  { eyes: "sleepy", mouth: "smallSmile" },
  { eyes: "wide", mouth: "smile" },
  { eyes: "happy", mouth: "grin" },
  { eyes: "normal", mouth: "neutral" },
] as const;

export type FaceVariant = number;

interface QueProps extends SVGProps<SVGSVGElement> {
  fill?: string;
  faceColor?: string;
  face?: FaceVariant;
}

export function Que({ fill = "currentColor", faceColor = "#1a1a1a", face, ...props }: QueProps) {
  const faceVariant = face !== undefined ? FACE_VARIANTS[face % FACE_VARIANTS.length] : null;
  const eyes = faceVariant ? EYES[faceVariant.eyes as keyof typeof EYES] : null;
  const mouth = faceVariant ? MOUTHS[faceVariant.mouth as keyof typeof MOUTHS] : null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 947.5 818.18"
      fill={fill}
      {...props}
    >
      <path d="M221.1,0h375.97c122.03,0,221.1,99.07,221.1,221.1v597.08H221.1C99.07,818.18,0,719.11,0,597.08V221.1C0,99.07,99.07,0,221.1,0Z" />
      <path d="M818.18,818.18h129.32s-55.43-35.63-92.83-65.12c-33.86-26.7-36.49-65.12-36.49-65.12v130.24Z" />
      {faceVariant && (
        <g fill={faceColor} stroke={faceColor}>
          {eyes}
          {mouth}
        </g>
      )}
    </svg>
  );
}
