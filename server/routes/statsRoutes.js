const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');

// GET STATS
router.get('/', async (req, res) => {
    try {
        const trades = await Trade.find();

        // 1. Calculate Metrics
        const totalTrades = trades.length;
        let netPnL = 0;
        let wins = 0;
        let losses = 0;

        trades.forEach(trade => {
            // FIX: use trade.netPnL instead of trade.pnl
            const tradePnL = Number(trade.netPnL) || 0;
            
            // Add to Net P&L 
            netPnL += tradePnL;

            // Win/Loss Count
            if (tradePnL > 0) wins++;
            else losses++;
        });

        const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;
        
        // 2. Send Data
        res.json({
            totalTrades,
            netPnL,
            winRate,
            wins,
            losses
        });

    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

module.exports = router;