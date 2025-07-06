# 🎯 Complete Wardrobe Escape Setup Guide

## 📱 **Step 1: Get the App Running on Your Phone**

### **Option A: Quick Connection (Recommended)**
The Expo development server is already running with tunnel mode for better connectivity.

1. **Download Expo Go**:
   - **iOS**: App Store → "Expo Go"
   - **Android**: Google Play → "Expo Go"

2. **Connect to the App**:
   - **Look in your terminal** for the QR code
   - **iOS**: Open Camera app → Point at QR code → Tap notification
   - **Android**: Open Expo Go app → Tap "Scan QR Code" → Scan
   
3. **Alternative Methods** if QR doesn't work:
   ```bash
   # In your terminal, press these keys:
   # 's' - Switch to Expo Go
   # 'a' - Open Android
   # 'i' - Open iOS  
   # 'w' - Open web browser
   ```

### **Option B: Troubleshooting Connection Issues**

If the app isn't loading, try these solutions:

1. **Network Issues**:
   ```bash
   # Stop current server
   # Press Ctrl+C in terminal
   
   # Restart with different modes
   npx expo start --tunnel    # Best for different networks
   npx expo start --lan       # Local network only
   npx expo start --localhost # Local only
   ```

2. **Clear Cache**:
   ```bash
   npx expo start --clear
   ```

3. **Manual URL Entry**:
   - Open Expo Go app
   - Tap "Enter URL manually"
   - Enter the exp:// URL from your terminal

4. **Check Network**:
   - Ensure phone and computer are on same WiFi
   - Disable VPN if running
   - Try mobile hotspot if WiFi issues

---

## 🚀 **Step 2: Set Up the Backend**

### **Prerequisites**
```bash
# Install Node.js 18+ from nodejs.org
node --version  # Should be 18+

# Install MongoDB (choose one):
# Option 1: Local MongoDB
brew install mongodb/brew/mongodb-community  # macOS
# OR
sudo apt install mongodb  # Ubuntu

# Option 2: MongoDB Atlas (Cloud - Recommended)
# Sign up at mongodb.com/atlas (free tier available)
```

### **Backend Setup**
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Edit .env file with your settings:
# Minimum required for development:
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/wardrobeescape
```

### **Start the Backend**
```bash
# Start MongoDB (if using local)
mongod

# In another terminal, start the backend
cd backend
npm run dev

# You should see:
# 🚀 Server running on port 3000
# 🍃 MongoDB Connected: localhost:27017
```

---

## 🔥 **Step 3: Firebase Setup (Authentication)**

### **Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: "wardrobe-escape"
4. Enable Google Analytics (optional)
5. Click "Create project"

### **Enable Authentication**
1. In Firebase Console → Click "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable:
   - **Email/Password**
   - **Google** (optional)
   - **Apple** (for iOS - optional)

### **Get Configuration**
1. Click "Project settings" (gear icon)
2. Scroll to "Your apps"
3. Click "Add app" → Web app
4. Enter app name: "Wardrobe Escape"
5. Copy the configuration object

### **Add to Frontend**
Create `firebase-config.js` in your app root:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Paste your config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

---

## 🎯 **Step 4: Test the Complete App**

### **Frontend Features to Test**
1. **Homepage**: Beautiful gradient with app branding
2. **Mirror Camera**: Front-facing camera with capture
3. **Wardrobe Assessment**: Add clothing items, select mood/event
4. **AI Recommendations**: Generate outfit suggestions

### **Backend API Testing**
```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
{
  "success": true,
  "message": "Wardrobe Escape Backend is running!",
  "timestamp": "2024-01-XX...",
  "version": "1.0.0"
}
```

---

## 🛠 **Common Issues & Solutions**

### **Expo App Issues**
```bash
# App won't load
npx expo start --clear --tunnel

# Metro bundler errors
npx expo install --fix

# Camera not working
# - Camera only works on physical device (not simulator)
# - Grant camera permissions when prompted
```

### **Backend Issues**
```bash
# MongoDB connection failed
# Check if MongoDB is running:
brew services start mongodb/brew/mongodb-community  # macOS
sudo systemctl start mongod  # Linux

# Port already in use
# Change PORT in .env file or kill existing process:
lsof -ti:3000 | xargs kill
```

### **Firebase Issues**
```bash
# Authentication errors
# - Check Firebase config is correct
# - Verify authentication methods are enabled
# - Check API keys are valid
```

---

## 📊 **What You Should See**

### **Mobile App Flow**
1. **Splash Screen** → Purple gradient homepage
2. **Tap "Start Mirror Check"** → Camera opens (front-facing)
3. **Take photo** → Navigate to wardrobe assessment
4. **Add clothing items** → Select event type & mood
5. **Tap "Generate My Outfit"** → AI recommendations with:
   - 3 outfit suggestions
   - Confidence levels (High/Medium/Low)
   - Detailed reasoning
   - Style notes and tips

### **Backend API**
- Server running on `http://localhost:3000`
- MongoDB connected and ready
- All API endpoints responding
- Health check returning success

---

## 🎉 **Success Indicators**

### **Frontend Working**:
- ✅ App loads on phone via Expo Go
- ✅ Camera opens and can take photos
- ✅ Can add wardrobe items
- ✅ AI generates outfit recommendations
- ✅ Beautiful UI with smooth navigation

### **Backend Working**:
- ✅ Server starts without errors
- ✅ MongoDB connection successful
- ✅ API endpoints responding
- ✅ Ready to integrate with frontend

---

## 🚀 **Next Steps After Setup**

1. **Connect Frontend to Backend**:
   - Update API endpoints in frontend
   - Add authentication integration
   - Test full data flow

2. **Add Real AI Processing**:
   - Integrate computer vision for clothing detection
   - Add color analysis
   - Implement machine learning recommendations

3. **Deploy to Production**:
   - Deploy backend to Heroku/Railway/AWS
   - Deploy MongoDB to Atlas
   - Configure Firebase for production
   - Build and deploy mobile app

---

## 📞 **Need Help?**

### **Common Commands**
```bash
# Restart everything fresh
npx expo start --clear --tunnel

# Check what's running on port 3000
lsof -i:3000

# Kill all node processes (if stuck)
pkill node

# Check MongoDB status
brew services list | grep mongodb  # macOS
systemctl status mongod            # Linux
```

### **Debugging**
- Check terminal for error messages
- Look at Expo Go app for JavaScript errors
- Use browser developer tools for web version
- Check backend logs for API errors

**Your Wardrobe Escape app is now ready! 🎊**

The app combines BeReal-style mirror selfies with AI-powered outfit recommendations, providing a complete fashion assistant experience on mobile.