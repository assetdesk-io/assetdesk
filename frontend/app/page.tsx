import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-900">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">AssetDesk</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link href="/register"
            className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Asset & Inventory Management
        </span>
        <h1 className="text-5xl font-bold text-gray-900 max-w-2xl leading-tight mb-6">
          Track every asset. <br className="hidden sm:block" />
          <span className="text-gray-400">From register to retire.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-10">
          One place to register, assign, and track every asset your organization owns — from procurement to retirement, across every team, site, and region.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/register"
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors">
            Create free account
          </Link>
          <Link href="/login"
            className="text-gray-600 px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:border-gray-400 transition-colors">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-100 px-8 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {[
            {
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
              title: 'Asset Registry',
              desc: 'Register, categorize, and track every asset with full lifecycle history.',
            },
            {
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
              title: 'Team & Location',
              desc: 'Assign assets to users, departments, and branches across your organization.',
            },
            {
              icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
              title: 'Audit & Reports',
              desc: 'Full audit trail, scheduled audits, and exportable reports on demand.',
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.icon} />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">
        © {new Date().getFullYear()} AssetDesk. All rights reserved.
      </footer>
    </main>
  );
}
