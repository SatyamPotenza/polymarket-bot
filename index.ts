import { ClobClient, ApiKeyCreds } from '@polymarket/clob-client';
import { Wallet } from 'ethers';
import { clear } from 'console';
import { config } from 'dotenv';

// Load environment variables
config();

// Environment variables
const CLOB_API_URL = process.env.CLOB_API_URL || 'https://clob.polymarket.com';
const PRIVATE_KEY = process.env.PK || ''; // Your Polygon private key
const API_KEY = process.env.CLOB_API_KEY || '';
const API_SECRET = process.env.CLOB_SECRET || '';
const API_PASSPHRASE = process.env.CLOB_PASS_PHRASE || '';
const CHAIN_ID = 137; // Polygon Mainnet

// Initialize the signer and credentials
const signer = new Wallet(PRIVATE_KEY);
const creds: ApiKeyCreds = {
  key: API_KEY,
  secret: API_SECRET,
  passphrase: API_PASSPHRASE,
};

// Initialize the CLOB client
const clobClient = new ClobClient(CLOB_API_URL, CHAIN_ID, signer, creds);

// Interface for market data
interface Market {
  question: string;
  tokens: Array<{
    outcome: string;
    price: string;
  }>;
}

// Function to fetch and display market data
async function fetchAndDisplayMarkets() {
  try {
    // Clear the terminal for a clean display
    clear();

    // Fetch markets with pagination (top 10)
    const markets: Market[] = [];
    let nextCursor: string | undefined = undefined;
    let fetchedCount = 0;

    while (fetchedCount < 10) {
      const response = await clobClient.getMarkets(nextCursor);
      if (!response.data || response.data.length === 0) {
        console.log('No more markets to fetch.');
        break;
      }

      markets.push(...response.data.map((market: any) => ({
        question: market.question,
        tokens: market.tokens.map((token: any) => ({
          outcome: token.outcome,
          price: token.price || 'N/A',
        })),
      })));

      fetchedCount += response.data.length;
      nextCursor = response.next_cursor;
      if (!nextCursor) break;
    }

    // Limit to top 10 markets
    const topMarkets = markets.slice(0, 10);

    // Display markets in a clean format
    console.log('=== Polymarket Real-Time Market Data ===\n');
    topMarkets.forEach((market) => {
      const outcomes = market.tokens.map((token) => `${token.outcome}: ${token.price}`).join(' | ');
      console.log(`Market: ${market.question}`);
      console.log(`${outcomes}\n`);
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
  }
}

// Function to run the fetch and display loop
function startMarketDataLoop() {
  // Validate private key
  if (!PRIVATE_KEY) {
    console.error('Error: Please set a valid PK in your .env file.');
    return;
  }

  // Fetch and display immediately
  fetchAndDisplayMarkets();

  // Refresh every 30 seconds
  setInterval(fetchAndDisplayMarkets, 3 * 1000);
}

// Start the application
startMarketDataLoop();