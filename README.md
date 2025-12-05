# IntelliWealth - Financial Planning App MVP 🚀

![Version](https://img.shields.io/badge/version-1.0.0--mvp-blue.svg)
![Status](https://img.shields.io/badge/status-MVP-green.svg)

A gamified financial planning web application that helps users manage their income, expenses, assets, liabilities, and life goals.

## 🌟 Live Demo

**Deploy this app to see it live at:** `https://[your-username].github.io/hello-world/`

See deployment instructions below! ⬇️

## ✨ MVP Features

### 📊 Page 1: Income & Expenses
- ✅ Interactive drag sliders for all income sources (salary, bonus, rental, business, etc.)
- ✅ Visual vault representation of your finances
- ✅ Real-time calculations of totals and net savings
- ✅ Savings rate calculation with animated progress bar

### ⚖️ Page 2: Assets & Liabilities
- ✅ Click-to-add functionality for loans and assets
- ✅ Dynamic balance scale that tilts based on net worth (realistic physics!)
- ✅ Editable amounts directly in balance boxes
- ✅ Remove functionality with one-click delete button

### 🎯 Page 3: Life Timeline Goals
- ✅ Age-based timeline from present age to 100 years
- ✅ Drag-and-drop goal placement on timeline
- ✅ Click-to-edit existing goals (age and budget)
- ✅ Delete functionality for all goals
- ✅ Special retirement handling:
  - Can only be added once
  - Default age is 60
  - Hover tooltip with helpful message

### 💾 Data Persistence (NEW!)
- ✅ **Auto-save:** All data automatically saved to browser localStorage
- ✅ **Export:** Download your complete financial plan as JSON
- ✅ **Import:** Upload previously exported data
- ✅ **Clear:** Remove all saved data with confirmation

### ⚙️ Data Management Menu
- Fixed floating menu button (top-right corner)
- Quick access to export, import, and clear functions
- Works across all pages

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Storage:** Browser localStorage API
- **Deployment:** GitHub Pages (static hosting)
- **No backend required** for MVP!

## 🚀 Quick Start - Run Locally

### Option 1: Direct Open
```bash
# Clone the repo
git clone https://github.com/GitHub-code542/hello-world.git
cd hello-world

# Checkout MVP branch
git checkout MVP

# Open in browser
open index.html
```

### Option 2: With Local Server
```bash
# Using Python
python -m http.server 8000
# Visit: http://localhost:8000

# OR using Node.js
npx http-server -p 8000
# Visit: http://localhost:8000
```

## 🌐 Deploy to GitHub Pages

### Step 1: Push to GitHub
```bash
# Make sure you're on MVP branch
git checkout MVP

# Push to GitHub
git push origin MVP
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub: https://github.com/GitHub-code542/hello-world
2. Click **Settings** → **Pages**
3. Under **Source**:
   - Branch: Select `MVP`
   - Folder: Select `/ (root)`
4. Click **Save**
5. Wait 2-3 minutes for deployment

### Step 3: Access Your Live App
Your app will be live at:
```
https://github-code542.github.io/hello-world/
```

**Note:** Replace `github-code542` with your actual GitHub username if different.

## 📁 Project Structure

```
hello-world/
├── index.html              # MVP application (main file)
├── gamified-ui5.html       # Latest development version
├── gamified-ui4.html       # Previous iterations
├── gamified-ui3.html
├── gamified-ui2.html
├── README.md               # This file
└── .git/
```

## 💡 How to Use

### First Time Users:
1. **Page 1:** Drag the sliders to set your income and expenses
2. **Page 2:** Click on loans/assets from the right panel and enter amounts
3. **Page 3:** Drag goal icons onto the timeline and set age/budget
4. **Save:** Click SAVE button on each page (or it auto-saves!)
5. **Data Menu:** Use ⚙️ button to export your data as backup

### Returning Users:
- Your data automatically loads when you open the app
- Continue where you left off!

## 🔄 Data Persistence Details

### What Gets Saved:
- ✅ All income/expense slider values
- ✅ All assets and liabilities in balance
- ✅ All timeline goals with positions
- ✅ Current age and gender settings
- ✅ Retirement goal status

### When Data Saves:
- ✅ When you click any SAVE button
- ✅ When you close/refresh the browser
- ✅ When you toggle gender setting
- ✅ When you add/edit/delete items

### Export/Import:
```javascript
// Export creates a JSON file like:
{
  "version": "1.0",
  "timestamp": "2024-12-05T10:30:00Z",
  "currentAge": "32",
  "gender": false,
  "page1": { "sliders": {...} },
  "page2": { "liabilities": [...], "assets": [...] },
  "page3": { "goals": [...], "retirementAdded": false }
}
```

## 🔒 Privacy & Security

- ✅ **100% Client-Side:** All data stored in YOUR browser
- ✅ **No Server:** Nothing sent to any server
- ✅ **No Tracking:** No analytics, no cookies
- ✅ **No Account Required:** Just open and use
- ✅ **Your Data, Your Control:** Export anytime

⚠️ **Important:** Data only exists in your current browser. If you:
- Clear browser data → Your financial plan is deleted
- Use different device → Data won't be there
- Switch browsers → Data won't transfer

**Solution:** Use the ⚙️ Export feature to backup your data!

## 🐛 Known Limitations (MVP)

| Limitation | Workaround |
|------------|------------|
| Data not synced across devices | Export from one device, import to another |
| No cloud backup | Use Export feature regularly |
| No user accounts | Not needed for MVP |
| Only supports INR currency | Coming in next version |
| Can't undo changes | Use Import to restore old backup |

## 🚧 Roadmap

### ✅ Phase 1: MVP (DONE!)
- [x] Core financial planning features
- [x] localStorage persistence
- [x] Export/Import functionality
- [x] GitHub Pages deployment

### 📋 Phase 2: Backend Integration (Next 2-4 weeks)
- [ ] Node.js + Express backend
- [ ] PostgreSQL database
- [ ] User authentication (JWT)
- [ ] Cloud storage
- [ ] Multi-device sync
- [ ] Email notifications

### 🎯 Phase 3: Advanced Features (2-3 months)
- [ ] Financial calculations engine
- [ ] Investment projections
- [ ] Retirement calculator
- [ ] PDF report generation
- [ ] Multi-currency support
- [ ] AI-powered recommendations

### 🚀 Phase 4: Production (3-6 months)
- [ ] React conversion
- [ ] Mobile app (React Native)
- [ ] Payment integration (Stripe)
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Multi-language support

## 🤝 Contributing

This is currently in MVP stage. Once we move to open-source production, contribution guidelines will be added.

## 📊 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |
| Opera | 76+ | ✅ Fully Supported |

## 🎓 Learning Resources

Want to understand how this was built?
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [GitHub Pages](https://pages.github.com/)

## 📞 Support & Feedback

- 🐛 Found a bug? [Open an issue](https://github.com/GitHub-code542/hello-world/issues)
- 💡 Have a feature idea? Let us know!
- 📧 Email: [your-email@example.com]

## 📄 License

Copyright © 2024 IntelliWealth. All rights reserved.

---

## 🎉 Ready to Deploy?

1. ✅ Code is ready in MVP branch
2. ✅ Data persistence implemented
3. ✅ Export/Import working
4. ✅ All features tested

**Next Step:** Follow the deployment instructions above and get your app live!

---

**Built with ❤️ for smarter financial planning**

*Last updated: December 2024*
