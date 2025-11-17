import { ContactForm } from '../components/forms/ContactForm'
import { NewsletterForm } from '../components/forms/NewsletterForm'

export const ContactPage = () => (
  <section className="space-y-8">
    <header className="text-center">
      <p className="text-xs uppercase tracking-[0.5em] text-brand-500">Support & updates</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">Contact us & subscribe</h1>
      <p className="mt-3 text-slate-500">
        Reach our banking operations team using the form, or stay informed with the newsletter.
      </p>
    </header>
    <div className="grid gap-6 lg:grid-cols-2">
      <ContactForm />
      <NewsletterForm />
    </div>
  </section>
)


