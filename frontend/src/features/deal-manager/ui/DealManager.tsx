import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { fetchContacts, type Contact } from '@/entities/contact'
import { createDeal, deleteDeal, fetchDeals, type Deal } from '@/entities/deal'

const emptyForm = {
  title: '',
  amount: '',
  status: 'new',
  priority: '',
  contact_id: '',
  expected_close_date: '',
}

export function DealManager() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [dealsData, contactsData] = await Promise.all([fetchDeals(), fetchContacts()])
      setDeals(dealsData)
      setContacts(contactsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    try {
      await createDeal({
        title: form.title,
        amount: form.amount ? Number(form.amount) : undefined,
        status: form.status,
        priority: form.priority || undefined,
        contact_id: form.contact_id,
        expected_close_date: form.expected_close_date || undefined,
      })
      setForm(emptyForm)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal')
    }
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      await deleteDeal(id)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deal')
    }
  }

  const contactName = (id: string) => contacts.find((c) => c.id === id)?.name ?? id

  return (
    <div>
      <h1>Deals</h1>

      <form onSubmit={(event) => void handleSubmit(event)}>
        <h2>New deal</h2>
        <div>
          <label>Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div>
          <label>Status</label>
          <input
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Priority</label>
          <input
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          />
        </div>
        <div>
          <label>Contact</label>
          <select
            value={form.contact_id}
            onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
            required
          >
            <option value="">Select contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Expected close date</label>
          <input
            type="date"
            value={form.expected_close_date}
            onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })}
          />
        </div>
        <button type="submit" disabled={contacts.length === 0}>
          Add deal
        </button>
      </form>

      {contacts.length === 0 && <p>Create a contact first.</p>}
      {error && <p>{error}</p>}

      <section>
        <h2>List</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : deals.length === 0 ? (
          <p>No deals yet</p>
        ) : (
          <ul>
            {deals.map((deal) => (
              <li key={deal.id}>
                <Link to={`/deals/${deal.id}`}>{deal.title}</Link>
                {' — '}
                {deal.status}
                {deal.amount && ` — ${deal.amount}`}
                {' — '}
                {contactName(deal.contact_id)}
                <button type="button" onClick={() => void handleDelete(deal.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
