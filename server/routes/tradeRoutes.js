const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const multer = require('multer');

// Image Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Get All Trades
router.get('/', async (req, res) => {
  try {
    const trades = await Trade.find().sort({ date: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add New Trade
router.post('/', upload.fields([{ name: 'entryImage' }, { name: 'exitImage' }]), async (req, res) => {
  try {
    const tradeData = JSON.parse(req.body.data);
    
    // Add file paths if images exist
    if (req.files['entryImage']) tradeData.entryImage = req.files['entryImage'][0].path;
    if (req.files['exitImage']) tradeData.exitImage = req.files['exitImage'][0].path;

    const newTrade = new Trade(tradeData);
    const savedTrade = await newTrade.save();
    res.status(201).json(savedTrade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Trade
router.delete('/:id', async (req, res) => {
  try {
    const trade = await Trade.findByIdAndDelete(req.params.id);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    res.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
