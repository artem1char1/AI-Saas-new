import { Link } from 'react-router-dom'

import { OrganizationSetup } from '@/features/organization-setup'
import { Header } from '@/widgets/header'

export function HomePage() {
  return (
    <div>
      <Header />
      <main>
        <h1>CRM</h1>
        <OrganizationSetup />
        <nav>
          <ul>
            <li>
              <Link to="/contacts">Contacts</Link>
            </li>
            <li>
              <Link to="/deals">Deals</Link>
            </li>
          </ul>
        </nav>
        <p>Flow: create organization → contact → deal → activity on deal page.</p>
      </main>
    </div>
  )
}
