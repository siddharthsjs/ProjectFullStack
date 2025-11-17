export const defaultUsers = [
  {
    id: 'user-101',
    name: 'Avery Stone',
    email: 'avery@aetherbank.app',
    role: 'user',
    status: 'active'
  },
  {
    id: 'user-102',
    name: 'Cameron Hart',
    email: 'cameron@aetherbank.app',
    role: 'user',
    status: 'active'
  },
  {
    id: 'sys-201',
    name: 'Morgan Reyes',
    email: 'morgan@aetherbank.app',
    role: 'sysadmin',
    status: 'active'
  }
]

export const defaultAccounts = [
  {
    id: 'ACC-1001',
    ownerId: 'user-101',
    label: 'Everyday Checking',
    bank: 'Aether Federal',
    branch: 'Midtown',
    balance: 5400.12,
    currency: 'USD',
    type: 'Checking',
    status: 'active'
  },
  {
    id: 'ACC-1002',
    ownerId: 'user-101',
    label: 'High-Yield Savings',
    bank: 'Northwind Credit',
    branch: 'Remote',
    balance: 18240.34,
    currency: 'USD',
    type: 'Savings',
    status: 'active'
  },
  {
    id: 'ACC-2001',
    ownerId: 'user-102',
    label: 'Travel Fund',
    bank: 'Aether Federal',
    branch: 'Downtown',
    balance: 3200.45,
    currency: 'USD',
    type: 'Savings',
    status: 'active'
  }
]

export const defaultTransactions = [
  {
    id: 'TX-9001',
    accountId: 'ACC-1001',
    type: 'deposit',
    amount: 2200,
    description: 'Payroll Deposit',
    date: '2025-11-10T14:40:00Z'
  },
  {
    id: 'TX-9002',
    accountId: 'ACC-1001',
    type: 'withdraw',
    amount: 150,
    description: 'Utilities Payment',
    date: '2025-11-12T10:10:00Z'
  },
  {
    id: 'TX-9003',
    accountId: 'ACC-1002',
    type: 'deposit',
    amount: 500,
    description: 'Monthly Transfer',
    date: '2025-11-03T18:00:00Z'
  }
]

export const defaultBanks = [
  {
    id: 'BANK-01',
    name: 'Aether Federal',
    country: 'United States',
    swift: 'AETHUS33',
    status: 'active',
    branches: [
      { id: 'BR-01', name: 'Midtown', city: 'New York' },
      { id: 'BR-02', name: 'Downtown', city: 'Atlanta' }
    ]
  },
  {
    id: 'BANK-02',
    name: 'Northwind Credit',
    country: 'Canada',
    swift: 'NRTHCA55',
    status: 'active',
    branches: [{ id: 'BR-03', name: 'Remote', city: 'Toronto' }]
  }
]

export const planCatalog = [
  {
    id: 'plan-lite',
    name: 'Starter',
    description: 'Link up to 3 bank accounts with automated refresh and alerts.',
    price: '$9',
    cadence: 'month',
    features: ['Multi-bank dashboard', 'AI-powered alerts', 'Basic budgeting']
  },
  {
    id: 'plan-grow',
    name: 'Growth',
    description: 'Designed for families tracking savings, credit and spending.',
    price: '$19',
    cadence: 'month',
    features: ['Unlimited accounts', 'Shared workspaces', 'Goal automation']
  },
  {
    id: 'plan-pro',
    name: 'Pro+',
    description: 'For wealth coaches and sysadmins orchestrating many users.',
    price: '$39',
    cadence: 'month',
    features: [
      'Multi-tenant support',
      'Premium support',
      'Advanced compliance reports'
    ]
  }
]

export const faqItems = [
  {
    id: 'faq-1',
    question: 'How often is my account data refreshed?',
    answer:
      'We poll connected banks every 15 minutes and also support on-demand refreshes from the dashboard.'
  },
  {
    id: 'faq-2',
    question: 'Is two-factor authentication supported?',
    answer:
      'Yes. You may enable hardware keys, authenticator apps, or SMS as backup factors from your security settings.'
  },
  {
    id: 'faq-3',
    question: 'Which regions are supported?',
    answer:
      'We currently support financial institutions across North America, the EU, and select APAC regions.'
  }
]

export const galleryProfiles = [
  {
    id: 'profile-1',
    name: 'Isa Rivera',
    title: 'Chief Design Officer',
    bio: 'Leading accessible-first financial experiences with inclusive UX.',
    image:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'profile-2',
    name: 'Tariq Khan',
    title: 'Head of Engineering',
    bio: 'Building resilient payment infrastructure and AI-led controls.',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'profile-3',
    name: 'Hana Lee',
    title: 'Customer Trust Lead',
    bio: 'Driving security reviews and cross-bank certifications.',
    image:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80'
  }
]


