const express = require('express');
const Trade = require('../models/Trade');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 


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
// DELETE TRADE AND REMOVE IMAGES
// --- SUPER DEBUG DELETE ROUTE ---
router.delete('/:id', async (req, res) => {
    console.log("\n>>> DELETE REQUEST RECEIVED <<<");
    console.log("Target Trade ID:", req.params.id);

    try {
        const trade = await Trade.findById(req.params.id);
        
        if (!trade) {
            console.log("❌ Error: Trade not found in database.");
            return res.status(404).json({ error: "Trade not found" });
        }

        console.log("✅ Trade found in Database.");
        console.log("--- PATH DATA IN DB ---");
        console.log("Entry Image Path:", trade.entryImage ? trade.entryImage : "(( NULL/UNDEFINED ))");
        console.log("Exit Image Path: ", trade.exitImage ? trade.exitImage : "(( NULL/UNDEFINED ))");
        console.log("-----------------------");

        const deleteImageFile = (dbFilePath) => {
            if (!dbFilePath) {
                console.log("⚠️ Skipping delete: No path recorded in database.");
                return;
            }

            // Fix slashes for Windows/Mac
            const normalizedPath = path.normalize(dbFilePath);
            // Construct absolute path
            const absolutePath = path.join(__dirname, '..', normalizedPath);

            console.log(`🔍 Looking for file on disk at: ${absolutePath}`);

            if (fs.existsSync(absolutePath)) {
                fs.unlink(absolutePath, (err) => {
                    if (err) console.log(`❌ System Error deleting file: ${err.message}`);
                    else console.log(`🗑️ SUCCESS: File deleted physically: ${absolutePath}`);
                });
            } else {
                console.log(`👻 GHOST FILE: Database says file is here, but it's missing from disk.`);
            }
        };

        // Try to delete images
        deleteImageFile(trade.entryImage);
        deleteImageFile(trade.exitImage);

        // Delete from DB
        await Trade.findByIdAndDelete(req.params.id);
        console.log("✅ Trade Record removed from Database.");
        
        res.json({ message: "Trade and images deleted successfully" });

    } catch (err) {
        console.log("💥 CRITICAL ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
