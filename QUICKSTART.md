# Quick Start Guide

Get the Dividend Discount Model Calculator running in 30 seconds!

## Step 1: Navigate to Directory

```bash
cd dividend-calculator
```

## Step 2: Start Local Server

**Python 3 (Recommended):**
```bash
python3 -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js:**
```bash
npx http-server -p 8000
```

## Step 3: Open Browser

Navigate to:
```
http://localhost:8000
```

## That's It! 🎉

The calculator should now be running with:
- ✅ Real-time calculations
- ✅ Interactive charts
- ✅ Full accessibility
- ✅ Responsive design

## Quick Test

1. Change "Current Dividend" to $10
2. Watch results update automatically
3. Click "Switch to Table" to see data view
4. Select "All" to compare all three models

## Troubleshooting

**Port 8000 already in use?**
```bash
# Use a different port
python3 -m http.server 8080
# Then open http://localhost:8080
```

**Module errors in console?**
- Make sure you're using a local server (not opening file:// directly)
- Verify all files are in the correct directory structure

**Chart.js not loading?**
- Check your internet connection (loads from CDN)
- Verify browser can access cdn.jsdelivr.net

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Test accessibility with keyboard navigation (Tab key)
- Try different model selections
- Check responsive design by resizing window

---

**Need Help?**
Check the browser console (F12) for error messages.
