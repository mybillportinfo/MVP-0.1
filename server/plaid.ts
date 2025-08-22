import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

// Plaid configuration
const configuration = new Configuration({
  basePath: process.env.PLAID_ENV === 'sandbox' 
    ? PlaidEnvironments.sandbox 
    : process.env.PLAID_ENV === 'production' 
    ? PlaidEnvironments.production 
    : PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

console.log('Plaid client configured for environment:', process.env.PLAID_ENV || 'development');
console.log('Plaid client ID configured:', !!process.env.PLAID_CLIENT_ID);
console.log('Plaid secret configured:', !!process.env.PLAID_SECRET);