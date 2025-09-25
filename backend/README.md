# TripOnBuddy Backend

AI-powered travel planning platform backend built with FastAPI.

## Features

- **AI-Powered Itineraries**: Generate personalized travel plans using Google Gemini AI
- **Image Management**: Automated scraping of high-quality destination images
- **Trip Management**: Complete CRUD operations for user trips
- **User Profiles**: Profile and statistics management
- **Feedback System**: Collect and manage user feedback
- **Caching**: In-memory caching for improved performance

## Architecture

The backend follows a modular architecture with clear separation of concerns:

```
app/
├── main.py              # FastAPI application
├── config.py            # Configuration settings
├── database.py          # MongoDB connection
├── models/              # Pydantic models
├── routers/             # API endpoints
├── services/            # Business logic
└── utils/               # Utilities
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the application:
```bash
python -m app.main
```

## API Endpoints

### Trips
- `POST /api/trips/generate` - Generate AI itinerary
- `GET /api/trips` - List user trips
- `GET /api/trips/{trip_id}` - Get specific trip
- `PUT /api/trips/{trip_id}` - Update trip
- `DELETE /api/trips/{trip_id}` - Delete trip

### Images
- `POST /api/images/bulk` - Bulk image fetching
- `POST /api/images/single` - Single location images

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get user feedback
- `GET /api/feedback/stats` - Admin statistics

## Environment Variables

- `MONGODB_URL` - MongoDB connection string
- `GOOGLE_GEMINI_API_KEY` - Google Gemini AI API key
- `CORS_ORIGINS` - Comma-separated allowed origins
- `CACHE_TTL` - Cache expiration time in seconds

## Development

The application uses:
- **FastAPI** for the web framework
- **MongoDB** with async PyMongo for database
- **Google Gemini AI** for itinerary generation
- **CacheTools** for caching
- **Pydantic** for data validation
