import { Link } from 'react-router-dom'
import AuthMenu from './AuthMenu'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-yarn-200 bg-yarn-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-yarn-900 hover:text-yarn-700">
            Stitch Counter
          </Link>
          <AuthMenu />
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
