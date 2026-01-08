const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// IMPORT ROUTES
const tradeRoutes = require('./routes/tradeRoutes');
const statsRoutes = require('./routes/statsRoutes'); // <--- NEW

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CONNECT ROUTES
app.use('/api/trades', tradeRoutes); 
app.use('/api/stats', statsRoutes); // <--- NEW: Plugs the stats back in

// SERVE IMAGES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ DB Connection Error:", err));

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));