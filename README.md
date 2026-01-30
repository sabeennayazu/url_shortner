# URL Shortener with Authentication System

A modern, beautiful Django-based URL shortener application with a complete authentication system, stunning Bootstrap UI, and comprehensive error handling.

## 🎯 Features

### Authentication System
- **User Registration** - Create new accounts with email validation
- **User Login** - Secure login with session management
- **User Logout** - Secure logout functionality
- **Password Validation** - Strong password requirements enforced
- **Error Handling** - Comprehensive error messages for better UX
- **Protected Routes** - All URL shortening features require authentication

### URL Shortening
- **Quick URL Shortening** - Convert long URLs to short codes in seconds
- **Custom Short Codes** - Option to create custom short codes
- **Click Tracking** - Track number of clicks on each shortened URL
- **Timestamp Recording** - Know when each URL was created
- **URL Management** - View, copy, open, and delete your shortened URLs
- **Statistics Dashboard** - See total URLs and clicks at a glance

### UI/UX
- **Modern Bootstrap 5 Design** - Beautiful, responsive interface
- **Glassmorphism Effects** - Stunning frosted glass aesthetic
- **Smooth Animations** - Elegant transitions and interactions
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Toast Notifications** - Real-time feedback for user actions
- **Icon Integration** - Bootstrap Icons for better visual communication

## 🚀 Installation

### Prerequisites
- Python 3.9+
- Django 5.2+
- pip

### Setup Steps

1. **Clone/Download the project**
```bash
cd url_shortner
```

2. **Create a virtual environment** (recommended)
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install django
```

4. **Run migrations**
```bash
python manage.py migrate
```

5. **Create a superuser** (optional, for admin panel)
```bash
python manage.py createsuperuser
```

6. **Start the development server**
```bash
python manage.py runserver
```

7. **Visit the application**
- Open your browser and go to `http://127.0.0.1:8000/`
- Register a new account or login
- Start shortening URLs!

## 📁 Project Structure

```
url_shortner/
├── accounts/
│   ├── models.py           # URLShortener model with auto-generate short codes
│   ├── views.py            # Authentication & URL shortening views
│   ├── urls.py             # URL routing
│   ├── admin.py            # Django admin registration
│   └── migrations/
├── config/
│   ├── settings.py         # Django settings
│   ├── urls.py             # Main URL configuration
│   ├── wsgi.py
│   └── asgi.py
├── templates/
│   ├── base.html           # Base template with navbar (Bootstrap)
│   ├── login.html          # Login page (Stunning UI)
│   ├── register.html       # Registration page (Stunning UI)
│   └── home.html           # Dashboard with URL shortener (Stunning UI)
├── static/                 # Static files (CSS, JS, Images)
├── manage.py
└── db.sqlite3             # SQLite database
```

## 🔑 Key Views & Endpoints

### Authentication Endpoints
- `GET/POST /login/` - User login
- `GET/POST /register/` - User registration
- `GET /logout/` - User logout
- `GET /` - Dashboard (requires login)

### API Endpoints
- `POST /api/shorten/` - Create shortened URL (AJAX)
- `DELETE /api/delete/<url_id>/` - Delete shortened URL (AJAX)
- `GET /s/<short_code>/` - Redirect to original URL

## 💾 Database Models

### URLShortener Model
```python
- user (ForeignKey to User)
- original_url (URLField)
- short_code (CharField, unique)
- created_at (DateTimeField)
- updated_at (DateTimeField)
- clicks (IntegerField)
```

## 🎨 UI Features

### Base Template
- Responsive navbar with user info
- Message alerts for success/error notifications
- Bootstrap 5 with custom styling
- Glassmorphism design pattern

### Login Page
- Clean, centered form
- Custom error handling with visual indicators
- Link to registration page
- Icon-based form fields

### Registration Page
- Complete user creation form
- Password strength requirements display
- Email validation
- Form error handling
- Link to login page

### Dashboard (Home)
- Hero section with greeting
- Statistics cards (Total URLs, Total Clicks)
- URL creation form with custom code option
- List of all user's shortened URLs
- Copy, Open, and Delete actions for each URL
- Empty state message when no URLs exist

## 🔒 Security Features

- **CSRF Protection** - Django CSRF tokens on all forms
- **Password Validation** - Multiple password validators
- **Authentication Required** - Login required for URL shortening
- **SQL Injection Prevention** - ORM prevents SQL injection
- **XSS Protection** - Django template escaping
- **Proper HTTP Methods** - GET/POST/DELETE properly implemented

## ⚙️ Error Handling

### User-Friendly Error Messages
- Invalid credentials on login
- Password mismatch on registration
- Duplicate username/email validation
- Invalid URL format handling
- Duplicate short code detection
- Custom code availability checking
- 404 errors for non-existent URLs

### Visual Feedback
- Toast notifications for success
- Error messages with icons
- Loading states on buttons
- Confirmation dialogs for destructive actions

## 📱 Responsive Design

- **Desktop**: Full-featured interface with all features visible
- **Tablet**: Optimized layout with touch-friendly buttons
- **Mobile**: Stacked layout with optimized spacing

## 🎯 Usage Examples

### Creating a Short URL
1. Navigate to the Dashboard (/)
2. Enter your long URL in the input field
3. (Optional) Enable custom code and enter a custom short code
4. Click "Shorten URL"
5. Your URL is created and added to your list!

### Viewing Shortened URLs
- Dashboard shows all your shortened URLs
- Each URL displays:
  - Short code (clickable link)
  - Original URL
  - Creation date & time
  - Click count

### Managing URLs
- **Copy**: Copy the short URL to clipboard
- **Open**: Open the short URL in a new tab
- **Delete**: Remove the shortened URL

## 🚀 Production Deployment

For production deployment:

1. Update `settings.py`:
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
SECRET_KEY = 'use-a-secure-random-key'
```

2. Collect static files:
```bash
python manage.py collectstatic
```

3. Use a production WSGI server (Gunicorn, uWSGI, etc.)

4. Use a production database (PostgreSQL recommended)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Support

For issues or questions, please check the code comments or contact support.

---

**Built with ❤️ using Django & Bootstrap 5**
