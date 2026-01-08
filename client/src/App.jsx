import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { calculateCharges } from './utils/calculations';
import { FaImage, FaTrash, FaPlus, FaArrowLeft, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import logoData from './assets/TradeVoid.png'; 

// Import your background component
import MatrixBackground from './components/MatrixBackground';

// --- COMPONENTS ---

const DashboardPage = () => {
  const [trades, setTrades] = useState([]);
  const [expandedTradeId, setExpandedTradeId] = useState(null); 
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  // Stats State
  const [stats, setStats] = useState({ netPnL: 0, winRate: 0 });

  const fetchData = async () => {
    try {
      const timestamp = Date.now();
      console.log("1. 🔄 Requesting Data...");

      // 1. Get Trades
      const listRes = await axios.get(`http://localhost:5000/api/trades?page=${page}&limit=10&_t=${timestamp}`);
      
      if (Array.isArray(listRes.data)) {
         setTrades(listRes.data);
         setTotalEntries(listRes.data.length);
      } else {
         setTrades(listRes.data.trades || []); 
         setTotalPages(listRes.data.totalPages || 1);
         setTotalEntries(listRes.data.totalTrades || 0);
      }

      // 2. Get Stats
      const statsRes = await axios.get(`http://localhost:5000/api/stats?_t=${timestamp}`);
      
      // --- DEBUGGING LOGS ---
      console.log("2. 📊 RAW STATS FROM SERVER:", statsRes.data);

      let finalStats = statsRes.data;

      // Handle if Mongo returns an array (e.g. [{ netPnL: 500 }]) instead of an object
      if (Array.isArray(statsRes.data)) {
          console.log("⚠️ Server sent an Array, extracting first item...");
          finalStats = statsRes.data[0] || { netPnL: 0, winRate: 0 };
      }

      console.log("3. ✅ FINAL STATS SET TO STATE:", finalStats);
      setStats(finalStats);

    } catch (err) { console.error("❌ Fetch Error:", err); }
  };

  // Run on load and when page changes
  useEffect(() => { fetchData(); }, [page]);

  const deleteTrade = async (e, id) => {
    e.stopPropagation(); 
    if(!window.confirm("Delete this trade?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/trades/${id}`);
      fetchData(); // Refresh immediately
    } catch (err) { 
        console.error("Delete Error:", err);
        alert("Failed to delete."); 
    }
  }

  const openImage = (e, path) => {
    e.stopPropagation();
    if(!path) return alert("No image uploaded.");
    const cleanPath = path.replace(/\\/g, "/"); 
    window.open(`http://localhost:5000/${cleanPath}`, '_blank');
  };

  const toggleTrade = (id) => {
    setExpandedTradeId(expandedTradeId === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative z-10">
      
      {/* 1. Stats Section */}
      <div className="flex-none grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-tv-card/90 backdrop-blur-sm p-6 rounded border border-tv-slate/20">
          <h3 className="text-tv-slate text-xs uppercase tracking-widest">Net P&L (All Time)</h3>
          <p className={`text-4xl font-mono mt-2 font-bold ${stats.netPnL >= 0 ? 'text-tv-emerald' : 'text-tv-crimson'}`}>
            ₹{stats.netPnL ? Number(stats.netPnL).toFixed(2) : "0.00"}
          </p>
        </div>
        <div className="bg-tv-card/90 backdrop-blur-sm p-6 rounded border border-tv-slate/20">
          <h3 className="text-tv-slate text-xs uppercase tracking-widest">Win Rate (All Time)</h3>
          <p className="text-4xl font-mono mt-2 text-white font-bold">{Math.round(stats.winRate || 0)}%</p>
        </div>
      </div>

      {/* 2. Header */}
      <div className="flex-none flex justify-between items-center border-b border-tv-slate/20 pb-2 mb-2 bg-black/40 p-2 rounded">
        <h2 className="text-xl font-bold text-white">All Trades</h2>
        <span className="text-xs text-tv-slate">
           Page {page} of {totalPages} • {totalEntries} Total
        </span>
      </div>

      {/* 3. Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-3 min-h-0">
          {trades.length === 0 && <p className="text-tv-slate text-center py-10 opacity-50 bg-black/50 rounded">Void is empty.</p>}
          
          {trades.map(t => (
            <div 
                key={t._id} 
                onClick={() => toggleTrade(t._id)}
                className={`bg-tv-card/95 backdrop-blur-md rounded border transition cursor-pointer hover:border-tv-slate/50 ${expandedTradeId === t._id ? 'border-tv-slate/50' : 'border-tv-slate/10'}`}
            >
              <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 flex-1">
                    <span className="font-bold text-white text-lg">{t.pair}</span>
                    <div className="flex items-center gap-3 text-sm text-tv-slate">
                        {t.expiry && (
                             <span className="bg-tv-slate/10 px-2 py-0.5 rounded text-xs border border-tv-slate/20 font-mono text-tv-slate/80">
                                {t.expiry}
                             </span>
                        )}
                        <span>{new Date(t.date).toLocaleDateString('en-GB')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <span className={`font-mono text-xl font-bold ${t.netPnL >= 0 ? 'text-tv-emerald' : 'text-tv-crimson'}`}>
                        {t.netPnL >= 0 ? '+' : ''}{Number(t.netPnL).toFixed(2)}
                    </span>
                    <div className="text-tv-slate text-xs">
                        {expandedTradeId === t._id ? <FaChevronUp/> : <FaChevronDown/>}
                    </div>
                </div>
              </div>

              {expandedTradeId === t._id && (
                  <div className="px-4 pb-4 pt-0 border-t border-tv-slate/10 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="text-sm text-tv-slate space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-tv-slate/20 px-2 py-1 rounded text-white font-mono text-xs border border-tv-slate/30">{t.trigger}</span>
                                <span className="text-xs uppercase tracking-wider opacity-70">{t.direction}</span>
                            </div>
                            <p><strong>Entry:</strong> {t.entryPrice} <span className="mx-2">→</span> <strong>Exit:</strong> {t.exitPrice}</p>
                            <p><strong>Qty:</strong> {t.quantity}</p>
                            <div className="bg-black/30 p-3 rounded border border-tv-slate/10 mt-2">
                                <p className="text-white italic">"{t.lesson || "No lesson recorded."}"</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between items-end gap-2">
                             <div className="flex gap-2">
                                {t.entryImage && (
                                    <button onClick={(e) => openImage(e, t.entryImage)} className="text-xs flex items-center gap-1 text-tv-slate hover:text-white transition bg-tv-dark px-3 py-2 rounded border border-tv-slate/20">
                                        <FaImage /> Entry Chart
                                    </button>
                                )}
                                {t.exitImage && (
                                    <button onClick={(e) => openImage(e, t.exitImage)} className="text-xs flex items-center gap-1 text-tv-slate hover:text-white transition bg-tv-dark px-3 py-2 rounded border border-tv-slate/20">
                                        <FaImage /> Exit Chart
                                    </button>
                                )}
                             </div>
                             <button 
                                onClick={(e) => deleteTrade(e, t._id)}
                                className="flex items-center gap-2 text-xs text-tv-crimson hover:text-red-400 hover:bg-tv-crimson/10 px-3 py-2 rounded transition"
                             >
                                <FaTrash /> Delete Entry
                             </button>
                        </div>
                    </div>
                  </div>
              )}
            </div>
          ))}
          <div className="h-4"></div>
      </div>

      {/* 4. Footer */}
      <div className="flex-none pt-4 flex justify-between items-center bg-black/40 p-2 rounded mt-2">
        <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className={`px-4 py-2 text-sm rounded font-bold transition ${page === 1 ? 'text-tv-slate opacity-50 cursor-not-allowed' : 'bg-tv-card text-white hover:bg-white hover:text-black'}`}
        >
            ← Previous
        </button>
        <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                (num === 1 || num === totalPages || (num >= page - 1 && num <= page + 1)) && (
                    <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition ${page === num ? 'bg-tv-emerald text-black' : 'text-tv-slate hover:bg-tv-slate/20'}`}
                    >
                        {num}
                    </button>
                )
            ))}
        </div>
        <button 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className={`px-4 py-2 text-sm rounded font-bold transition ${page === totalPages || totalPages === 0 ? 'text-tv-slate opacity-50 cursor-not-allowed' : 'bg-tv-card text-white hover:bg-white hover:text-black'}`}
        >
            Next →
        </button>
      </div>
    </div>
  );
};

const TradeFormPage = () => {
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      pairType: 'NIFTY',
      optionType: 'CALL',
      lotsInput: 1,
      trigger: 'SUP',
      direction: 'LONG'
    }
  });
  
  const navigate = useNavigate();
  const pairType = watch('pairType');
  
  const onSubmit = async (data) => {
    let finalPair = data.pairType;
    let finalDirection = data.direction; 
    
    if (data.pairType === 'NIFTY' || data.pairType === 'SENSEX') {
        finalPair = `${data.pairType} ${data.strikeName} ${data.optionType}`;
        finalDirection = 'LONG'; 
    } else {
        finalPair = data.customPair;
    }
    
    let finalQuantity = Number(data.lotsInput);
    if (data.pairType === 'NIFTY') finalQuantity = finalQuantity * 65;
    else if (data.pairType === 'SENSEX') finalQuantity = finalQuantity * 20;

    const gross = (finalDirection === 'LONG' 
        ? (data.exitPrice - data.entryPrice) 
        : (data.entryPrice - data.exitPrice)) * finalQuantity;

    const fees = calculateCharges(Number(data.entryPrice), Number(data.exitPrice), finalQuantity);
    
    const formData = new FormData();
    const payload = { 
        ...data, 
        pair: finalPair,
        expiry: data.expiry,
        direction: finalDirection,
        quantity: finalQuantity, 
        grossPnL: gross, 
        netPnL: gross - fees, 
        brokerage: fees,
        isScalp: false
    };
    
    formData.append('data', JSON.stringify(payload));
    if(data.entryImage && data.entryImage[0]) formData.append('entryImage', data.entryImage[0]);
    if(data.exitImage && data.exitImage[0]) formData.append('exitImage', data.exitImage[0]);

    try {
      await axios.post('http://localhost:5000/api/trades', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      alert("Trade Saved Successfully!"); 
      reset();
      navigate('/'); 
    } catch (err) { 
        console.error("Submit Error:", err);
        alert('Error saving trade.'); 
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scroll pr-2 relative z-10">
      <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-md">Log New Trade</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-tv-card/95 backdrop-blur-md p-6 rounded border border-tv-slate/20 shadow-xl">
        
        {/* ROW 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="col-span-1">
             <label className="text-xs text-tv-slate block mb-1">Index / Asset</label>
             <select {...register('pairType', { required: true })} className="w-full bg-tv-dark p-3 rounded border border-tv-slate/20 text-white outline-none">
                 <option value="NIFTY">NIFTY</option>
                 <option value="SENSEX">SENSEX</option>
                 <option value="OTHER">OTHER</option>
             </select>
          </div>
          <div className="col-span-1">
             <label className="text-xs text-tv-slate block mb-1">Expiry (e.g. 13 JAN)</label>
             <input {...register('expiry')} placeholder="13 JAN" className="w-full bg-tv-dark p-3 rounded border border-tv-slate/20 text-white focus:border-tv-emerald outline-none" />
          </div>
          {pairType === 'OTHER' ? (
             <div className="col-span-2">
                <label className="text-xs text-tv-slate block mb-1">Asset Name</label>
                <input {...register('customPair', { required: true })} placeholder="e.g. RELIANCE" className="w-full bg-tv-dark p-3 rounded border border-tv-slate/20 text-white focus:border-tv-emerald outline-none" />
             </div>
          ) : (
             <>
               <div className="col-span-1">
                 <label className="text-xs text-tv-slate block mb-1">Strike</label>
                 <input {...register('strikeName', { required: true })} placeholder="23500" className="w-full bg-tv-dark p-3 rounded border border-tv-slate/20 text-white focus:border-tv-emerald outline-none" />
               </div>
               <div className="col-span-1">
                 <label className="text-xs text-tv-slate block mb-1">Type</label>
                 <div className="flex bg-tv-dark rounded border border-tv-slate/20 overflow-hidden">
                    <label className={`flex-1 text-center py-3 cursor-pointer text-xs font-bold transition ${watch('optionType') === 'CALL' ? 'bg-green-900/40 text-green-400' : 'text-tv-slate hover:bg-white/5'}`}>
                        <input type="radio" {...register('optionType')} value="CALL" className="hidden"/> CE
                    </label>
                    <div className="w-[1px] bg-tv-slate/20"></div>
                    <label className={`flex-1 text-center py-3 cursor-pointer text-xs font-bold transition ${watch('optionType') === 'PUT' ? 'bg-red-900/40 text-red-400' : 'text-tv-slate hover:bg-white/5'}`}>
                        <input type="radio" {...register('optionType')} value="PUT" className="hidden"/> PE
                    </label>
                 </div>
               </div>
             </>
          )}
        </div>

        {/* ROW 3 */}
        {pairType === 'OTHER' && (
            <div className="mb-6">
                <label className="text-xs text-tv-slate block mb-1">Direction</label>
                <select {...register('direction')} className="w-full bg-tv-dark p-3 rounded border border-tv-slate/20 text-white outline-none">
                    <option value="LONG">LONG 🟢 (Buy)</option>
                    <option value="SHORT">SHORT 🔴 (Sell)</option>
                </select>
            </div>
        )}

        {/* ROW 4 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs text-tv-slate block mb-1">Entry Price</label>
            <input {...register('entryPrice', { required: true })} type="number" step="0.05" className="w-full bg-tv-dark p-3 rounded border border-tv-slate/20 text-white focus:border-tv-emerald outline-none" />
          </div>
          <div>
            <label className="text-xs text-tv-slate block mb-1">Exit Price</label>
            <input {...register('exitPrice', { required: true })} type="number" step="0.05" className="w-full bg-tv-dark p-3 rounded border border-tv-slate/20 text-white focus:border-tv-emerald outline-none" />
          </div>
          <div>
            <label className="text-xs text-tv-slate block mb-1">
                {pairType === 'OTHER' ? 'Quantity' : `Lots (${pairType === 'NIFTY' ? '65/lot' : '20/lot'})`}
            </label>
            <input {...register('lotsInput', { required: true })} type="number" className="w-full bg-tv-dark p-3 rounded border border-tv-slate/20 text-white focus:border-tv-emerald outline-none" />
          </div>
        </div>
        
        {/* ROW 5 */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div>
             <label className="text-xs text-tv-slate block mb-1">Trigger (Why?)</label>
             <select {...register('trigger', { required: true })} className="w-full bg-tv-dark p-3 rounded border border-tv-slate/20 text-white outline-none">
              <option value="SUP">SUP (Support)</option>
              <option value="RES">RES (Resistance)</option>
              <option value="BRO">BRO (Breakout)</option>
              <option value="BRD">BRD (Breakdown)</option>
              <option value="GAP">GAP (Gap Fill)</option>
              <option value="GMB">GMB (Gamble)</option>
            </select>
          </div>
        </div>

        {/* IMAGES */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
               <label className="block text-xs text-tv-slate mb-1">Entry Chart</label>
               <div className="bg-tv-dark p-3 rounded border border-tv-slate/20">
                 <input type="file" {...register('entryImage')} className="w-full text-xs text-tv-slate file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-tv-slate/20 file:text-white hover:file:bg-tv-slate/30" />
               </div>
          </div>
          <div>
               <label className="block text-xs text-tv-slate mb-1">Exit Chart</label>
               <div className="bg-tv-dark p-3 rounded border border-tv-slate/20">
                 <input type="file" {...register('exitImage')} className="w-full text-xs text-tv-slate file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-tv-slate/20 file:text-white hover:file:bg-tv-slate/30" />
               </div>
          </div>
        </div>

        <textarea {...register('lesson')} maxLength="140" placeholder="One Lesson (Optional)..." className="w-full bg-tv-dark p-3 rounded border border-tv-slate/20 text-white mb-6 h-20 resize-none focus:border-tv-emerald outline-none"></textarea>

        <button type="submit" className="w-full bg-tv-emerald text-black font-bold py-3 rounded hover:bg-green-400 transition shadow-lg shadow-green-900/20">SAVE TO JOURNAL</button>
      </form>

      <div className="mt-8 flex justify-center pb-8">
        <Link to="/" className="flex items-center gap-2 text-tv-slate hover:text-white transition"><FaArrowLeft /> Back to Dashboard</Link>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT ---

function App() {
  return (
    <BrowserRouter>
      {/* WRAPPER */}
      <div className="h-screen w-screen bg-transparent text-tv-text font-sans flex flex-col overflow-hidden relative">
        
        {/* BACKGROUND */}
        <MatrixBackground />

        {/* HEADER */}
        <header className="flex-none max-w-5xl w-full mx-auto relative flex justify-center items-center py-6 px-4 z-10">
          <Link to="/" className="hover:opacity-80 transition">
            <img src={logoData} alt="TradeVoid Logo" className="h-28 w-auto object-contain drop-shadow-lg" />
          </Link>
          
          {/* Header Action Button (Desktop) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
             <Routes>
               <Route path="/" element={
                 <Link to="/add" className="bg-white text-black font-bold px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-200 transition text-sm">
                   <FaPlus /> Log Trade
                 </Link>
               } />
               {/* FIX: Catch-all route to silence warning on /add page */}
               <Route path="*" element={null} />
             </Routes>
          </div>
          
          {/* Header Action Button (Mobile) */}
          <div className="md:hidden absolute top-28 mt-2 right-4">
             <Routes>
               <Route path="/" element={
                 <Link to="/add" className="bg-white text-black font-bold px-3 py-1 rounded flex items-center gap-2 hover:bg-gray-200 transition text-xs">
                   <FaPlus /> Log
                 </Link>
               } />
               {/* FIX: Catch-all route for mobile too */}
               <Route path="*" element={null} />
             </Routes>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 pb-4 overflow-hidden flex flex-col z-10">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add" element={<TradeFormPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;