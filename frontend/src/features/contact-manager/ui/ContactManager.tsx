import { useEffect, useState, type FormEvent } from 'react'

import {
  createContact,
  deleteContact,
  fetchContacts,
  type Contact,
} from '@/entities/contact'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company_name: '',
  position: '',
}

export function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadContacts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setContacts(await fetchContacts())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadContacts()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    try {
      await createContact({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company_name: form.company_name || undefined,
        position: form.position || undefined,
      })
      setForm(emptyForm)
      await loadContacts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact')
    }
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      await deleteContact(id)
      await loadContacts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact')
    }
  }

  return (
    <div>
      <h1>Contacts</h1>

      <form onSubmit={(event) => void handleSubmit(event)}>
        <h2>New contact</h2>
        <div>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label>Company</label>
          <input
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          />
        </div>
        <div>
          <label>Position</label>
          <input
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />
        </div>
        <button type="submit">Add contact</button>
      </form>

      {error && <p>{error}</p>}

      <section>
        <h2>List</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : contacts.length === 0 ? (
          <p>No contacts yet</p>
        ) : (
          <ul>
            {contacts.map((contact) => (
              <li key={contact.id}>
                <strong>{contact.name}</strong>
                {contact.email && ` — ${contact.email}`}
                {contact.company_name && ` (${contact.company_name})`}
                <button type="button" onClick={() => void handleDelete(contact.id)}>
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
