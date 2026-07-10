import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

// Base de datos de airdrops activos en Solana (actualizable)
const ACTIVE_AIRDROPS = [
  {
    name: "Jupiter JUP",
    status: "active",
    eligibility: "Jupiter users before Nov 2023",
    claim_url: "https://jup.ag/",
    deadline: "2026-12-31",
    estimated_value: "$50-500",
    requirements: ["Wallet activity", "Volume traded"]
  },
  {
    name: "Kamino KMNO",
    status: "active", 
    eligibility: "Kamino lenders/borrowers",
    claim_url: "https://app.kamino.finance/",
    deadline: "2026-08-15",
    estimated_value: "$25-200",
    requirements: ["Lending activity", "Points earned"]
  },
  {
    name: "Drift DRIFT",
    status: "active",
    eligibility: "Drift traders",
    claim_url: "https://app.drift.trade/",
    deadline: "2026-09-30",
    estimated_value: "$100-1000",
    requirements: ["Trading volume", "Perp positions"]
  },
  {
    name: "Jito JTO",
    status: "claimable",
    eligibility: "JitoSOL holders",
    claim_url: "https://www.jito.network/",
    deadline: "2026-10-31",
    estimated_value: "$75-300",
    requirements: ["JitoSOL balance", "Staking duration"]
  },
  {
    name: "Tensor TNSR",
    status: "active",
    eligibility: "NFT traders on Tensor",
    claim_url: "https://www.tensor.trade/",
    deadline: "2026-11-15",
    estimated_value: "$30-150",
    requirements: ["NFT trades", "Volume"]
  }
];

// Endpoint: Listar todos los airdrops activos
app.get('/api/airdrops', (c) => {
  const status = c.req.query('status');
  let airdrops = ACTIVE_AIRDROPS;

  if (status) {
    airdrops = airdrops.filter(a => a.status === status);
  }

  return c.json({
    count: airdrops.length,
    airdrops,
    last_updated: new Date().toISOString(),
    disclaimer: "DYOR - Verify all claims on official sites"
  });
});

// Endpoint: Buscar airdrop específico
app.get('/api/airdrops/:name', (c) => {
  const name = c.req.param('name').toLowerCase();
  const airdrop = ACTIVE_AIRDROPS.find(a => 
    a.name.toLowerCase().includes(name)
  );

  if (!airdrop) {
    return c.json({ error: "Airdrop not found", available: ACTIVE_AIRDROPS.map(a => a.name) }, 404);
  }

  return c.json({
    airdrop,
    days_remaining: Math.ceil((new Date(airdrop.deadline) - new Date()) / (1000 * 60 * 60 * 24))
  });
});

// Endpoint: Verificar elegibilidad (simulado)
app.get('/api/airdrops/check/:address', async (c) => {
  const address = c.req.param('address');

  // En producción, esto consultaría on-chain
  return c.json({
    address,
    potential_airdrops: ACTIVE_AIRDROPS.filter(a => a.status === 'active').length,
    estimated_total_value: "$180-2,150",
    action_required: "Visit individual claim sites to verify",
    tools: {
      solana_fm: `https://solana.fm/address/${address}`,
      solscan: `https://solscan.io/account/${address}`
    }
  });
});

// Health check
app.get('/health', (c) => c.json({ 
  status: 'ok',
  service: 'Solana Airdrop Finder',
  active_airdrops: ACTIVE_AIRDROPS.length,
  version: '1.0.0'
}));

// Documentación
app.get('/', (c) => c.json({
  name: 'Solana Airdrop Finder API',
  description: 'Find active and claimable airdrops in the Solana ecosystem',
  endpoints: {
    '/api/airdrops': 'List all active airdrops',
    '/api/airdrops?status=active': 'Filter by status (active/claimable/ended)',
    '/api/airdrops/:name': 'Get specific airdrop details',
    '/api/airdrops/check/:address': 'Check wallet for potential airdrops'
  },
  donation: 'BKjS4agVRowFGqUuWHEKZerk3dCS52V1n4NdWaeNTo8E'
}));

const port = process.env.PORT || 3001;
serve({ fetch: app.fetch, port });
console.log(`🪂 Airdrop Finder running on port ${port}`);
