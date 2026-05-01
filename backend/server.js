const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/flags', require('./routes/flags'));
app.use('/api/upload', require('./routes/upload'));
<<<<<<< HEAD
app.use('/api/detection', require('./routes/detection'));
=======
app.use('/api/ngo-transactions', require('./routes/ngoTransactions'));
>>>>>>> 08800f72c918522264955fedbb07598c3a4a183e

// Chain Status Endpoint
const { auditTrail } = require('./services/blockchainService');
app.get('/api/chain/verify', async (req, res) => {
  try {
    const intact = await auditTrail.verifyChain();
    const blockCount = Number(await auditTrail.getChainLength());
    const lastBlock = await auditTrail.chain(blockCount - 1);
    res.json({ intact, blockCount, lastBlockHash: lastBlock.blockHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
