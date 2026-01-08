export const calculateCharges = (entry, exit, qty, isIntraday = true) => {
    const turnover = (entry + exit) * qty;
    
    // Approximate Indian Charge Constants (Zerodha/Groww Standard)
    const brokerage = Math.min(40, turnover * 0.0003); 
    const stt = isIntraday ? (exit * qty) * 0.00025 : turnover * 0.001; 
    const exchangeTxn = turnover * 0.0000345;
    const gst = (brokerage + exchangeTxn) * 0.18;
    const sebi = turnover * 0.000001;
    const stamp = (entry * qty) * 0.00003;

    return Number((brokerage + stt + exchangeTxn + gst + sebi + stamp).toFixed(2));
};