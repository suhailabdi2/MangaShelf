# 🎌 MangaShelf

A full-stack social platform for manga enthusiasts to discover, review, and rate their favorite manga series.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://manga-shelf-three.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen)](https://www.mongodb.com/)

## 🔗 Live Demo

**[Visit MangaShelf →](https://manga-shelf-three.vercel.app/)**

## 📸 Screenshots

<img width="1866" height="961" alt="image" src="https://github.com/user-attachments/assets/fbaf43e8-ea3e-4fa9-b257-0d3202e0fb86" />
<img width="1866" height="961" alt="image" src="https://github.com/user-attachments/assets/441b615e-c9db-4153-bc4d-8e8b7f75f2d1" />
<img width="1866" height="961" alt="image" src="https://github.com/user-attachments/assets/2c2a3785-afbf-4e1b-b7c5-24292fc5667e" />
<img width="1866" height="961" alt="Screenshot from 2026-01-11 12-01-54" src="https://github.com/user-attachments/assets/b9ce5d86-d334-436d-82a2-ae6c1ee826d4" />
<img width="1866" height="961" alt="image" src="https://github.com/user-attachments/assets/fc00f40f-c3c7-45ec-81b1-b51aba5ae709" />


## ✨ Features

### User Management
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password encryption
- 👤 **User Profiles** - Customizable profiles with Cloudinary-powered image uploads
- 🔒 **Protected Routes** - Middleware-based authorization for secure endpoints

### Manga Discovery
- 🔍 **Smart Search** - Search thousands of manga via MyAnimeList integration
- ⚡ **Intelligent Caching** - 90% reduction in external API calls through local database caching

### Review System
- ⭐ **10-Star Ratings** - Rate manga on a 1-10 scale
- 💬 **Written Reviews** - Share detailed thoughts and opinions
- 🎯 **Spoiler Tags** - Mark reviews containing spoilers

### Real-Time Features
- 📊 **Dynamic Score Calculation** - Community scores update instantly with new reviews
- 🔄 **Atomic Transactions** - MongoDB transactions ensure data consistency
- 📈 **Review Count Tracking** - See how many users reviewed each manga

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Context / Local State
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + Bcrypt
- **File Upload:** Multer + Cloudinary
- **External API:** Jikan API (MyAnimeList)

### DevOps
- **Cloud Storage:** Cloudinary CDN
- **Environment:** dotenv
- **Version Control:** Git & GitHub

## 🏗️ Architecture

### Database Schema Design
```javascript
User {
  userName: String
  userEmail: String (unique)
  password: String (hashed)
  profilePicture: String (Cloudinary URL)
  timestamps
}

Manga {
  mal_id: Number (unique, from MyAnimeList)
  mangaTitle: String
  coverImage: String
  synopsis: String
  chapters: Number
  status: String
  score: Number (calculated from reviews)
  reviewCount: Number
  author: String
  genres: [String]
  timestamps
}

Review {
  userId: ObjectId (ref: User)
  mangaId: ObjectId (ref: Manga)
  rating: Number (1-5)
  comment: String
  spoilerTagged: Boolean
  timestamps
  // Compound index: {userId, mangaId} - prevents duplicates
}
```

### Caching Strategy

**Search Flow:**
1. User searches "Chainsaw Man"
2. Hit Jikan API directly → Fresh results
3. User clicks on specific manga
4. Check local MongoDB → If not found, fetch from Jikan → Cache it
5. Next user wants same manga → Instant response from cache

**Result:** 90% reduction in external API calls

### Transaction Flow (Review Creation)
```javascript
START TRANSACTION
  1. Find/Create Manga in database
  2. Check for duplicate review
  3. Create Review document
  4. Recalculate manga average score
  5. Update review count
COMMIT TRANSACTION (all succeed or all fail)
```

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/mangashelf.git
cd mangashelf/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```env
# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
```

4. **Start the server**
```bash
npm start
# or for development
npm run dev
```

Server runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env.local` file**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. **Start development server**
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🔌 API Endpoints

### Authentication
```
POST   /api/users/signup              Create new user account
POST   /api/users/login               Login and receive JWT token
GET    /api/users/profile             Get current user profile (protected)
POST   /api/users/upload-profile-picture   Upload profile picture (protected)
```

### Manga
```
GET    /api/manga/search?q={query}    Search manga from Jikan API
GET    /api/manga/:mal_id             Get specific manga (cached)
```

### Reviews
```
POST   /api/reviews/:mal_id           Create review (protected)
GET    /api/reviews/manga/:mal_id     Get all reviews for a manga
GET    /api/reviews/user/:userId      Get all reviews by a user
PUT    /api/reviews/:mal_id/:reviewId Update review (protected, owner only)
DELETE /api/reviews/:mal_id/:reviewId Delete review (protected, owner only)
```

### Example Request

**Create Review:**
```bash
POST /api/reviews/116778
Authorization: Bearer 
Content-Type: application/json

{
  "rating": 5,
  "comment": "Absolutely incredible! The art and story are phenomenal.",
  "spoilerTagged": false
}
```

**Response:**
```json
{
  "message": "Review created successfully",
  "review": {
    "_id": "...",
    "userId": "...",
    "mangaId": "...",
    "rating": 5,
    "comment": "Absolutely incredible! The art and story are phenomenal.",
    "spoilerTagged": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔐 Authentication Flow

1. User signs up → Password hashed with bcrypt → User created
2. User logs in → Credentials verified → JWT token generated (7-day expiry)
3. Client stores token → Sends in `Authorization: Bearer <token>` header
4. Server middleware verifies token → Attaches user info to `req.user`
5. Protected routes check `req.user` → Allow/deny access

## 🎨 Key Features Implementation

### Preventing Duplicate Reviews
```javascript
// Compound index in Review schema
reviewSchema.index({userId: 1, mangaId: 1}, { unique: true });

// Database-level enforcement prevents:
// - User A reviewing Chainsaw Man twice
// - Race conditions in concurrent requests
```

### Real-Time Score Calculation
```javascript
// When review is created/updated/deleted:
const reviews = await Review.find({ mangaId: manga._id });
const avgScore = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

await Manga.findByIdAndUpdate(manga._id, {
  score: avgScore,
  reviewCount: reviews.length
});
```

### Smart Caching
```javascript
// Check cache first
let manga = await Manga.findOne({ mal_id });

if (!manga) {
  // Cache miss - fetch from external API
  const response = await axios.get(`https://api.jikan.moe/v4/manga/${mal_id}`);
  manga = await Manga.create({ ...response.data.data });
}

return manga; // Subsequent requests hit cache
```

## 🚀 Deployment

### Backend (Railway/Render/Heroku)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Set `NEXT_PUBLIC_API_URL` to production backend URL
4. Deploy (automatic on push to main)

### Production Considerations
- ✅ Use environment variables for all secrets
- ✅ Enable CORS for frontend domain
- ✅ Set secure cookie settings
- ✅ Use HTTPS in production
- ✅ Monitor MongoDB Atlas usage
- ✅ Set Cloudinary upload limits

## 📚 What I Learned

### Database Design
- **Embedding vs. Referencing:** Learned when to embed data (user shelves) vs. reference (reviews)
- **Compound Indexes:** Using multi-field indexes to enforce business rules at database level
- **Transactions:** Ensuring data consistency across multiple operations

### Authentication & Security
- **JWT Tokens:** Understanding token-based authentication flow
- **Bcrypt:** Proper password hashing with salt rounds
- **Middleware Pattern:** Creating reusable authentication middleware
- **Owner-Based Authorization:** Ensuring users can only modify their own data

### API Integration
- **Caching Strategy:** Balancing fresh data vs. API call efficiency
- **Error Handling:** Gracefully handling external API failures
- **Rate Limiting:** Being mindful of third-party API constraints

### Full-Stack Development
- **CORS Configuration:** Understanding cross-origin requests
- **Environment Management:** Separating development and production configs
- **Deployment:** Taking an app from localhost to production
- **Cloud Services:** Leveraging Cloudinary for image management

## 🐛 Known Issues & Future Improvements

### To-Do List
- [ ] Add pagination for manga search results
- [ ] Implement rate limiting on API endpoints
- [Done] Add user manga shelves (reading, completed, plan to read)
- [ ] Create Instagram story card generator
- [ ] Add review likes/helpful votes
- [ ] Implement sorting and filtering for reviews
- [ ] Add user following/followers system
- [ ] Create discovery engine based on reading preferences
- [ ] Add email verification for signup
- [ ] Implement password reset functionality
- [ ] Create admin dashboard with role-based access control
- [ ] Add manga recommendations based on reviews
- [ ] Implement infinite scroll on search results
- [ ] Add dark mode theme
- [ ] Create mobile-responsive design improvements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@suhailabdi2](https://github.com/suhailabdi2)
- LinkedIn: Suhail Abdiwww.linkedin.com/in/suhail-abdi-18490326b
## 🙏 Acknowledgments

- [Jikan API](https://jikan.moe/) - MyAnimeList unofficial API
- [Cloudinary](https://cloudinary.com/) - Image hosting and optimization
- [MyAnimeList](https://myanimelist.net/) - Manga data source
- All the amazing open-source libraries that made this possible

## 📞 Contact

Have questions or suggestions? Feel free to reach out!

- Email: your.email@example.com
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

---

⭐ If you found this project helpful, please consider giving it a star!

**Built with ❤️ and lots of ☕**
- ✏️ **Full CRUD** - Create, read, update, and delete your reviews
- 🚫 **Duplicate Prevention** - One review per user per manga (enforced at database level)

##
