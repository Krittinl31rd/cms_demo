export default function Button({ children, variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl transition cursor-pointer";
  const variants = {
    primary: "bg-primary text-white",
    gray: "bg-gray-200 hover:bg-gray-300 text-black",
    danger: "bg-red-500 text-white",
    success: "bg-green-500 text-white",
  };

  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
