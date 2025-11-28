# Drag-and-Drop Timeline Instructions

## The Problem
The chartjs-plugin-dragdata might not be loading from CDN or may have compatibility issues.

## Quick Test
1. Open index.html in your browser
2. Open Browser Console (F12 or right-click > Inspect > Console tab)
3. Look for messages like:
   - "DragData plugin available: true/false"
   - Any errors about "dragdata" or "Chart"

## If Drag is NOT Working:

### Solution 1: Check Plugin Loading
The plugin should load from this CDN:
```
https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@2.2.5/dist/chartjs-plugin-dragdata.min.js
```

Try opening that URL directly in your browser to verify it loads.

### Solution 2: Alternative - Use Local Plugin
Download the plugin file and place it in the same folder as index.html, then change line 11 to:
```html
<script src="./chartjs-plugin-dragdata.min.js"></script>
```

### Solution 3: Verify Chart.js Version
Make sure Chart.js 4.4.0 is compatible with the dragdata plugin version.

## How Drag SHOULD Work:

1. **Hover over a goal** → Cursor changes to ✋ (grab hand)
2. **Click and hold** → Cursor changes to 🤏 (grabbing hand)
3. **Drag left/right** → Changes the AGE (x-axis)
4. **Drag up/down** → Changes the AMOUNT (y-axis)
5. **Release** → 🎉 Confetti + form fields update automatically

## What CAN be dragged:
- ✅ Education goals
- ✅ Marriage goals
- ✅ Home Purchase
- ✅ Car Purchase
- ✅ Retirement (age only, amount fixed)
- ✅ All Custom Goals

## What CANNOT be dragged:
- ❌ "You are here" (current age marker) - this is your fixed reference point

## Expected Console Output:
When dragging works correctly, you should see:
```
DragData plugin available: true
Dragging: Home Purchase
Updated: Home Purchase to age 50 amount $300,000
Updated home goal in form
```

## Troubleshooting Steps:

1. **Check browser console** for errors
2. **Verify plugin URL** loads without 404
3. **Try different browser** (Chrome, Firefox, Edge)
4. **Clear browser cache** and reload
5. **Check internet connection** (plugin loads from CDN)

## Alternative: Click to Add Goals
Even if drag doesn't work, you can still:
- Click anywhere on the chart to add goals at that position
- The modal will pre-fill with the age and amount from where you clicked
- Edit existing goals by changing values in Sections 1-9

## Contact
If drag still doesn't work, please share:
1. Browser console errors (F12 > Console tab)
2. Browser name and version
3. Whether the plugin URL loads when opened directly
