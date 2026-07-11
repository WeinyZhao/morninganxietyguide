import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, id }) => (
      <h1 id={id} className="text-3xl sm:text-4xl font-bold mt-8 mb-4 text-brand-900 dark:text-brand-50">
        {children}
      </h1>
    ),
    h2: ({ children, id }) => (
      <h2 id={id} className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-brand-900 dark:text-brand-50 scroll-mt-20">
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3 id={id} className="text-xl sm:text-2xl font-semibold mt-6 mb-3 text-brand-800 dark:text-brand-100 scroll-mt-20">
        {children}
      </h3>
    ),
    h4: ({ children, id }) => (
      <h4 id={id} className="text-lg font-semibold mt-4 mb-2 text-brand-800 dark:text-brand-100">
        {children}
      </h4>
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
    hr: () => <hr className="my-8 border-brand-200 dark:border-brand-800" />,
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full text-sm border border-brand-200 dark:border-brand-800 rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left font-semibold bg-brand-50 dark:bg-brand-900/50 border-b border-brand-200 dark:border-brand-800">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 border-b border-brand-100 dark:border-brand-800">
        {children}
      </td>
    ),
    ...components,
  };
}
