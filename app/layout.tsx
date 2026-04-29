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
<header className="flex items-center justify-between px-24 py-8">
  {/* Left group */}
  <div className="flex items-center gap-10">
    <Link href="/" className="text-4xl font-semibold tracking-tight">
      Komorebi
    </Link>

    <nav className="flex items-center gap-6 text-sm">
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
        </header>

        {/* PAGE CONTENT */}
        <main>{children}</main>
      </body>
    </html>
  );
}
