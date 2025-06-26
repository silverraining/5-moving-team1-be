export const TEST_CONFIG = {
  customer: {
    email: 'your-customer@example.com',
    password: 'your-customer-password',
  },
  movers: [
    { email: 'mover1@example.com' },
    { email: 'mover2@example.com' },
    { email: 'mover3@example.com' },
    { email: 'mover4@example.com' },
  ],
  defaultPassword: 'your-default-password',
} as const;
