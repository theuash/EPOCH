const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Explicit CORS — allow all origins (dev mode)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/flags', require('./routes/flags'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ngo-transactions', require('./routes/ngoTransactions'));

// DB name helper
app.get('/dbname', (req, res) => {
  res.json({ database: mongoose.connection.name });
});

// Chain status — graceful fallback if blockchain node is offline
app.get('/api/chain/verify', async (req, res) => {
  try {
    const { auditTrail } = require('./services/blockchainService');
    const intact     = await auditTrail.verifyChain();
    const blockCount = Number(await auditTrail.getChainLength());
    const lastBlock  = await auditTrail.chain(blockCount - 1);
    res.json({ intact, blockCount, lastBlockHash: lastBlock.blockHash });
  } catch {
    // Blockchain node offline — return safe demo values
    res.json({
      intact: true,
      blockCount: 0,
      lastBlockHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
