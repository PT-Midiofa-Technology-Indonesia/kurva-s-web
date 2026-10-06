export interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-600 px-4">
      {/* Decorative shape 1 - outer dashed */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width="586"
          height="754"
          viewBox="0 0 586 754"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            opacity="0.4"
            x="360.183"
            y="0.683013"
            width="259"
            height="719"
            rx="129.5"
            transform="rotate(30 360.183 0.683013)"
            fill="#05C7C0"
            stroke="#91FEF1"
            strokeDasharray="8 8"
          />
          <rect
            opacity="0.4"
            x="368.968"
            y="33.4677"
            width="211"
            height="671"
            rx="105.5"
            transform="rotate(30 368.968 33.4677)"
            fill="#05C7C0"
            stroke="#91FEF1"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-lg justify-center">{children}</div>
    </div>
  );
}
