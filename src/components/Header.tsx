import Link from "next/link";
import { usePathname } from "next/navigation";

// SVG flat de judô (kimono)
const JudoIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2 align-middle"
  >
    <rect x="7" y="4" width="18" height="24" rx="4" fill="#032611" />
    <rect x="10" y="8" width="12" height="16" rx="2" fill="white" />
    <rect x="14" y="16" width="4" height="8" rx="1" fill="#032611" />
    <rect x="12" y="12" width="8" height="2" rx="1" fill="#032611" />
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const isOnCriarContaPage = pathname === "/criar-conta";
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-950/95 backdrop-blur-sm shadow-lg transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <JudoIcon />
              <span className="text-2xl font-bold text-white align-middle">
                Judô <span className="text-yellow-400">Sandokan</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            {!isOnCriarContaPage && (
              <Link
                href="/criar-conta"
                className="text-white hover:text-primary-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Criar Conta
              </Link>
            )}
            <Link
              href="/login"
              className="bg-primary-800 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
