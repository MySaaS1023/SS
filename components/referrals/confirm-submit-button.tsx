"use client";

export function ConfirmSubmitButton({
  children,
  message,
  className = "",
  name = "action",
  value = "paid",
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
  name?: string;
  value?: string;
}) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
