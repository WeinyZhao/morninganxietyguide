import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl sm:text-4xl font-bold mt-8 mb-4 text-brand-900 dark:text-brand-50">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-brand-900 dark:text-brand-50 scroll-mt-20">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-3 text-brand-800 dark:text-brand-100 scroll-mt-20">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-brand-800 dark:text-brand-200 leading-relaxed mb-4">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 text-brand-800 dark:text-brand-200 space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 text-brand-800 dark:text-brand-200 space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    a: ({ href, children }) => {
      const isInternal = href?.startsWith("/") || href?.startsWith("#");
      if (isInternal && href) {
        return (
          <Link
            href={href}
            className="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-200 underline"
          >
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-200 underline"
        >
          {children}
        </a>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-brand-400 pl-4 italic text-brand-700 dark:text-brand-300 my-4">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-brand-900 dark:text-brand-50">
        {children}
      </strong>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-brand-200 dark:border-brand-700">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-brand-200 dark:border-brand-700 px-4 py-2 bg-brand-50 dark:bg-brand-900/50 text-left font-semibold text-brand-900 dark:text-brand-100">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-brand-200 dark:border-brand-700 px-4 py-2 text-brand-800 dark:text-brand-200">
        {children}
      </td>
    ),
    ...components,
  };
}
