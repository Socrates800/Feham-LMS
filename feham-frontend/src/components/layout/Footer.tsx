import Link from 'next/link';

export function Footer() {
  const product = ['Features', 'Pricing', 'Security', 'Integrations'];
  const company = ['About', 'Careers', 'Contact', 'Blog'];

  return (
    <footer className="border-t border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-extrabold text-white">
              F
            </span>
            <span className="text-xl font-extrabold text-gray-950 dark:text-white">Feham</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-gray-600 dark:text-gray-400">
            Modern school operations for ambitious Pakistani private schools.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-950 dark:text-white">Product</h3>
          <div className="mt-4 grid gap-3 text-sm text-gray-600 dark:text-gray-400">
            {product.map((item) => (
              <Link key={item} href={item === 'Pricing' ? '/pricing' : '/features'} className="hover:text-violet-600 dark:hover:text-violet-300">
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-950 dark:text-white">Company</h3>
          <div className="mt-4 grid gap-3 text-sm text-gray-600 dark:text-gray-400">
            {company.map((item) => (
              <Link key={item} href={item === 'About' ? '/about' : 'mailto:hello@feham.app'} className="hover:text-violet-600 dark:hover:text-violet-300">
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-950 dark:text-white">Social</h3>
          <div className="mt-4 flex gap-3">
            {['X', 'GH', 'in'].map((label) => (
              <Link
                key={label}
                href="https://example.com"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-xs font-bold text-gray-600 transition-colors hover:border-violet-400 hover:text-violet-600 dark:border-gray-800 dark:text-gray-400 dark:hover:border-violet-400 dark:hover:text-violet-300"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-gray-200 px-4 pt-8 text-sm text-gray-500 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Feham. All rights reserved.</p>
        <p>Terms · Privacy · Cookies</p>
      </div>
    </footer>
  );
}



