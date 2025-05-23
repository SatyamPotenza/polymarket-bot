import { ClobClient, ApiKeyCreds } from '@polymarket/clob-client';
import { Wallet } from 'ethers';
import { config } from 'dotenv';

// Load environment variables
config();

const CLOB_API_URL = process.env.CLOB_API_URL || 'https://clob.polymarket.com';
const PRIVATE_KEY = process.env.PK || ''; // Your Polygon private key
const CHAIN_ID = 137; // Polygon Mainnet

async function generateApiKeys() {
  // Validate private key
  if (!PRIVATE_KEY) {
    console.error('Error: Please set a valid PK in your .env file.');
    return;
  }

  // Initialize the signer
  const signer = new Wallet(PRIVATE_KEY);

  // Initialize the CLOB client with chain ID
  const client = new ClobClient(CLOB_API_URL, CHAIN_ID, signer);

  try {
    const apiCreds: ApiKeyCreds = await client.createOrDeriveApiKey();
    console.log('API Key:', apiCreds.key);
    console.log('Secret:', apiCreds.secret);
    console.log('Passphrase:', apiCreds.passphrase);
    console.log('Save these credentials in your .env file.');
  } catch (error) {
    console.error('Error generating API credentials:', error);
  }
}

generateApiKeys();