# Wardrobe Escape Backend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project (for authentication)

### Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

4. **Start Development Server**
```bash
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### AI Recommendations
- `POST /api/ai/generate-outfit` - Generate AI outfit recommendations
- `POST /api/ai/save-outfit` - Save AI-generated outfit
- `GET /api/ai/wardrobe-analysis` - Analyze user's wardrobe
- `POST /api/ai/style-feedback` - Submit feedback on recommendations
- `GET /api/ai/style-trends` - Get current style trends

### Wardrobe Management
- `GET /api/wardrobe` - Get user's wardrobe items
- `POST /api/wardrobe` - Add new wardrobe item

### Outfits
- `GET /api/outfits` - Get user's saved outfits
- `POST /api/outfits` - Save new outfit

### File Upload
- `POST /api/upload/image` - Upload image file

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🔧 Configuration

### Firebase Setup
1. Create Firebase project
2. Enable Authentication
3. Generate service account key
4. Add to environment variables

### MongoDB Setup
```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/wardrobeescape

# MongoDB Atlas (recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wardrobeescape
```

## 🛡️ Security Features
- Firebase authentication
- Rate limiting
- CORS protection
- Input validation
- Error handling
- Helmet security headers

## 📊 Database Models
- **User**: User profiles and preferences
- **WardrobeItem**: Individual clothing items
- **Outfit**: Saved outfit combinations
- **Collection**: Outfit collections (future)

## 🤖 AI Features
- Intelligent outfit generation
- Mood-based styling
- Event-appropriate recommendations
- Wardrobe gap analysis
- Style trend integration

## 🚦 Development Commands
```bash
npm run dev      # Start development server
npm start        # Start production server
npm test         # Run tests
npm run lint     # Run linter
```

## 🌐 Environment Variables
See `.env.example` for all configuration options.

## 📱 Mobile App Integration
The backend is designed to work seamlessly with the React Native frontend via REST API.