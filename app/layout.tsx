import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* HEADER */}
        <header className="px-4 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8">
          <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:gap-x-10">
              <Link href="/" className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Komorebi
              </Link>

              <nav className="flex items-center gap-4 text-sm sm:gap-6">
                <Link href="/about" className="hover:underline">
                  About
                </Link>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </nav>
            </div>

            {/* Instagram */}
            <a
              href="https://instagram.com/milenainna"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:opacity-70"
            >
              Instagram
            </a>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main>{children}</main>
      </body>
    </html>
  );
}
