import { NavBar } from '@/components/NavBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>{children}</main>
    </div>
  )
}
