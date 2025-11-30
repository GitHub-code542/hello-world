# JavaScript Dependencies

This folder contains the JavaScript libraries used by the Interactive Financial Planning Application.

## Required Files

### 1. Chart.js v4.4.0
**File**: `chart.umd.min.js`
**Purpose**: Interactive charting library for creating the timeline visualization
**Download**: https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
**Size**: ~220 KB (minified)
**License**: MIT
**Documentation**: https://www.chartjs.org/

### 2. chartjs-plugin-dragdata v2.2.5
**File**: `chartjs-plugin-dragdata.min.js`
**Purpose**: Enables drag-and-drop functionality for chart data points
**Download**: https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@2.2.5/dist/chartjs-plugin-dragdata.min.js
**Size**: ~15 KB (minified)
**License**: MIT
**Documentation**: https://github.com/chrispahm/chartjs-plugin-dragdata

## Installation Options

### Option 1: Automatic Setup (Recommended)

**Linux/Mac:**
```bash
./setup-dependencies.sh
```

**Windows:**
```cmd
setup-dependencies.bat
```

### Option 2: Manual Download

1. **Download Chart.js v4.4.0:**
   ```bash
   curl -L -o js/chart.umd.min.js https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
   ```

2. **Download chartjs-plugin-dragdata v2.2.5:**
   ```bash
   curl -L -o js/chartjs-plugin-dragdata.min.js https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@2.2.5/dist/chartjs-plugin-dragdata.min.js
   ```

### Option 3: Use CDN (Default)

If files are not present locally, the application will automatically fall back to CDN:
- Chart.js: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`
- Drag Plugin: `https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@2.2.5/dist/chartjs-plugin-dragdata.min.js`

## Benefits of Local Files

✅ **Offline functionality** - Works without internet
✅ **Faster loading** - No CDN latency
✅ **Version control** - Guaranteed compatibility
✅ **Privacy** - No external requests
✅ **Reliability** - No CDN downtime concerns

## File Structure

```
js/
├── README.md                          # This file
├── chart.umd.min.js                   # Chart.js library (download required)
└── chartjs-plugin-dragdata.min.js     # Drag plugin (download required)
```

## Verification

After downloading, verify files are present:

**Linux/Mac:**
```bash
ls -lh js/
```

**Windows:**
```cmd
dir js\
```

You should see:
- `chart.umd.min.js` (~220 KB)
- `chartjs-plugin-dragdata.min.js` (~15 KB)

## Troubleshooting

### Downloads fail with network error
- Check your internet connection
- Try using a VPN if behind a restrictive firewall
- Download manually from the URLs above using your browser
- Or continue using CDN links (application works fine without local files)

### Files won't download
If automated downloads fail, you can:
1. Open the URLs in your browser
2. Save the files manually to the `js/` folder
3. Ensure filenames match exactly

### Application not using local files
Check that:
1. Files are in the correct `js/` folder
2. File names are exactly as specified (case-sensitive)
3. Clear browser cache and refresh

## Version Information

| Library | Version | Release Date | Status |
|---------|---------|--------------|--------|
| Chart.js | 4.4.0 | October 2023 | Stable |
| chartjs-plugin-dragdata | 2.2.5 | June 2023 | Stable |

## Updates

To update to newer versions:
1. Check compatibility with your application
2. Update version numbers in URLs
3. Re-run setup script
4. Test drag functionality thoroughly

---

**Note**: This application uses vanilla JavaScript (no build process required). Simply download the files and open `index.html` in your browser!
