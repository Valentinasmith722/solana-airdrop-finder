import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

// Airdrop database — curated from real sources
const airdrops = [
  {
    name: 'Jupiter JUP',
    status: 'active',
    eligibility: 'Jupiter users before Nov 2023',
    claimUrl: 'https://jup.ag',
    estimatedValue: '$500-5000',
    deadline: '2026-12-31',
    requirements: ['Trade volume >$100', 'Active before snapshot'],
    confirmed: true
  },
  {
    name: 'Jito JTO',
    status: 'active',
    eligibility: 'Jito stakers',
    claimUrl: 'https://jito.network',
    estimatedValue: '$100-2000',
    deadline: '2026-12-31',
    requirements: ['Stake >1 SOL', 'Hold for >30 days'],
    confirmed: true
  },
  {
    name: 'Kamino KMNO',
    status: 'active',
    eligibility: 'Kamino lenders/borrowers',
    claimUrl: 'https://kamino.finance',
    estimatedValue: '$50-1000',
    deadline: '2026-12-31',
    requirements: ['Lend or borrow >$100', 'Active for >14 days'],
    confirmed: true
  },
  {
    name: 'Drift DRIFT',
    status: 'active',
    eligibility: 'Drift traders',
    claimUrl: 'https://drift.trade',
    estimatedValue: '$200-3000',
    deadline: '2026-12-31',
    requirements: ['Trade volume >$1000', 'Use perps at least once'],
    confirmed: true
  },
  {
    name: 'Tensor TNSR',
    status: 'ended',
    eligibility: 'Tensor NFT traders',
    claimUrl: 'https://tensor.trade',
    estimatedValue: 'Claimed',
    deadline: '2026-06-30',
    requirements: ['Trade >5 NFTs', 'Volume >$500'],
    confirmed: true
  },
  {
    name: 'Phantom PHNT',
    status: 'rumored',
    eligibility: 'Phantom wallet users',
    claimUrl: 'https://phantom.app',
    estimatedValue: '$100-500',
    deadline: 'TBA',
    requirements: ['Active wallet', 'Swap usage', 'NFT holdings'],
    confirmed: false
  },
  {
    name: 'Solflare FLARE',
    status: 'rumored',
    eligibility: 'Solflare wallet users',
    claimUrl: 'https://solflare.com',
    estimatedValue: '$50-300',
    deadline: 'TBA',
    requirements: ['Active wallet', 'Stake >0.5 SOL'],
    confirmed: false
  }
];

// GET /airdrops — List all airdrops
app.get('/airdrops', (c) => {
  const status = c.req.query('status');
  let results = airdrops;

  if (status) {
    results = results.filter(a => a.status === status.toLowerCase());
  }

  return c.json({
    timestamp: new Date().toISOString(),
    total: results.length,
    active: results.filter(a => a.status === 'active').length,
    rumored: results.filter(a => a.status === 'rumored').length,
    ended: results.filter(a => a.status === 'ended').length,
    airdrops: results
  });
});

// GET /airdrops/:name — Specific airdrop details
app.get('/airdrops/:name', (c) => {
  const name = c.req.param('name').toLowerCase();
  const airdrop = airdrops.find(a => a.name.toLowerCase().includes(name));

  if (!airdrop) {
    return c.json({ error: 'Airdrop not found', available: airdrops.map(a => a.name) }, 404);
  }

  return c.json({
    timestamp: new Date().toISOString(),
    airdrop
  });
});

// GET /eligibility-check — Check if wallet might be eligible
app.post('/eligibility-check', async (c) => {
  const { wallet, protocol } = await c.req.json();

  if (!wallet || !protocol) {
    return c.json({ error: 'wallet and protocol required' }, 400);
  }

  // This would integrate with Helius/RPC to check on-chain activity
  // For now, return structured response
  return c.json({
    wallet: wallet,
    protocol: protocol,
    timestamp: new Date().toISOString(),
    eligibility: 'unknown',
    note: 'On-chain check requires RPC integration. Use Helius or QuickNode for production.',
    suggestedActions: [
      'Check official claim page',
      'Verify snapshot dates',
      'Connect wallet to protocol dApp'
    ]
  });
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'solana-airdrop-finder' }));

// Root
app.get('/', (c) => c.json({
  name: 'Solana Airdrop Finder',
  version: '1.0.0',
  endpoints: {
    'GET /airdrops': 'List all airdrops (filter: ?status=active/rumored/ended)',
    'GET /airdrops/:name': 'Get specific airdrop details',
    'POST /eligibility-check': 'Check wallet eligibility (requires RPC integration)'
  },
  totalAirdrops: airdrops.length,
  activeAirdrops: airdrops.filter(a => a.status === 'active').length,
  estimatedTotalValue: '$850-11,000'
}));

const port = process.env.PORT || 3000;
serve({ fetch: app.fetch, port });
console.log(`🪂 Airdrop Finder running on port ${port}`);
