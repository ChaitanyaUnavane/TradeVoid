const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

app.use('/uploads', express.static(uploadDir));

// --- CONNECT TO MONGODB (FIXED) ---
// We removed useNewUrlParser and useUnifiedTopology because they are default now.
mongoose.connect('mongodb://localhost:27017/tradevoid')
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Schema
const tradeSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  pair: String,
  expiry: String, // <--- NEW FIELD
  type: String, 
  direction: String, 
  entryPrice: Number,
  exitPrice: Number,
  quantity: Number,
  grossPnL: Number,
  brokerage: Number,
  netPnL: Number,
  lots: Number,
  trigger: String, 
  lesson: String,
  entryImage: String,
  exitImage: String
});
const Trade = mongoose.model('Trade', tradeSchema);

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- ROUTES ---

// 1. GET PAGINATED TRADES
app.get('/api/trades', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalTrades = await Trade.countDocuments();
    const totalPages = Math.ceil(totalTrades / limit);

    const trades = await Trade.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ trades, currentPage: page, totalPages, totalTrades });
  } catch (err) {
    console.error("GET Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET GLOBAL STATS
app.get('/api/stats', async (req, res) => {
  try {
    const pnlStats = await Trade.aggregate([
      { $group: { _id: null, totalPnL: { $sum: "$netPnL" } } }
    ]);

    const totalTrades = await Trade.countDocuments();
    const winningTrades = await Trade.countDocuments({ netPnL: { $gt: 0 } });
    
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const totalPnL = pnlStats.length > 0 ? pnlStats[0].totalPnL : 0;

    res.json({ totalPnL, winRate });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. ADD NEW TRADE
app.post('/api/trades', upload.fields([{ name: 'entryImage' }, { name: 'exitImage' }]), async (req, res) => {
  try {
    // console.log("Received Body:", req.body); 
    const data = JSON.parse(req.body.data); 
    
    if (req.files['entryImage']) data.entryImage = req.files['entryImage'][0].path;
    if (req.files['exitImage']) data.exitImage = req.files['exitImage'][0].path;

    const newTrade = new Trade(data);
    await newTrade.save();
    res.json(newTrade);
  } catch (err) {
    console.error("POST Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE TRADE
app.delete('/api/trades/:id', async (req, res) => {
  try {
    await Trade.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));