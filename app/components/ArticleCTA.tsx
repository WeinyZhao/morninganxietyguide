import Link from "next/link";

interface Props {
  variant: "primary" | "secondary";
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export default function ArticleCTA({
  variant,
  title,
  description,
  buttonText,
  href,
}: Props) {
  const isPrimary = variant === "primary";
  return (
    <div
      className={`not-prose my-8 p-6 rounded-2xl text-center ${
        isPrimary
          ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-xl"
          : "bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800"
      }`}
    >
      <h3
        className={`text-xl sm:text-2xl font-bold mb-2 ${
          isPrimary ? "text-white" : "text-brand-900 dark:text-brand-50"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm sm:text-base mb-4 ${
          isPrimary ? "text-brand-50" : "text-brand-700 dark:text-brand-300"
        }`}
      >
        {description}
      </p>
      <Link
        href={href}
        className={`inline-block px-6 py-3 font-semibold rounded-full transition-all active:scale-95 ${
          isPrimary
            ? "bg-white text-brand-600 hover:bg-brand-50"
            : "bg-brand-500 text-white hover:bg-brand-600"
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
}
