# 🏁 AllGasNoBrakes Photography

Professional automotive photography portfolio website showcasing high-performance vehicles, classic cars, and automotive artistry.

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.0.1-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚗 Overview

AllGasNoBrakes is a modern, responsive photography portfolio website designed specifically for automotive photography. The site features dynamic photo galleries, category filtering, automatic carousels, and a sleek dark theme that highlights automotive imagery.

### ✨ Key Features

- **Responsive Design** - Optimized for all devices from mobile to desktop
- **Dynamic Photo Galleries** - Automatic loading from photo directories
- **Category Filtering** - Organize photos by Supercars, Classic, Sports, and Studio
- **Auto-Scrolling Carousels** - Desktop and mobile carousels with smooth animations
- **Contact Form** - Integrated with Web3Forms for client inquiries
- **Performance Optimized** - Lazy loading, separate mobile/desktop images

## 🛠️ Tech Stack

- **Backend**: Python Flask 2.0.1
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Animations**: GSAP (GreenSock)
- **Contact Form**: Web3Forms API
- **Booking**: Calendly Integration
- **Deployment**: GitHub Pages / Vercel / Heroku compatible

## 📁 Project Structure

```
allgasnobrakes/
├── app.py                  # Flask application & routing
├── requirements.txt        # Python dependencies
├── PHOTO_MANAGEMENT.md     # Photo management guide
├── static/
│   ├── default.css        # Main stylesheet
│   ├── js/
│   │   └── script.js      # JavaScript functionality
│   └── photos/
│       ├── desktop/       # Full-size photos
│       └── mobile/        # Mobile-optimized photos
└── templates/
    ├── base.html          # Base template
    ├── index.html         # Home page
    ├── about.html         # About page
    ├── portfolio.html     # Portfolio gallery
    ├── contact.html       # Contact form
    └── view_image.html    # Full-size image viewer
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dropbop/allgasnobrakes.git
cd allgasnobrakes
```

2. **Create virtual environment** (recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables** (optional)
```bash
export FLASK_ENV=development
export WEB3FORMS_KEY=your-web3forms-key-here
```

5. **Run the application**
```bash
python app.py
```

6. **Open in browser**
```
http://localhost:5000
```

## 📸 Photo Management

Photos are automatically loaded from the `static/photos/` directory. No database required!

### Quick Guide

- **Add photos**: Upload to `static/photos/desktop/` and `static/photos/mobile/`
- **Categories**: Use filename prefixes like `supercars-001-ferrari.jpg`
- **Carousel**: First photos alphabetically appear in home page carousel
- **About page**: Use "about_me" in filename

For detailed instructions, see [PHOTO_MANAGEMENT.md](PHOTO_MANAGEMENT.md)

## 🎨 Customization

### Styling
- Edit `static/default.css` for theme changes
- CSS variables in `:root` for easy color customization
- Responsive breakpoints at 768px, 414px, 375px, 320px

### Categories
Edit the categories list in `app.py`:
```python
categories = ['supercars', 'classic', 'sports', 'studio']
```

### Contact Form
Set your Web3Forms access key:
```python
web3forms_key = os.environ.get('WEB3FORMS_KEY', 'your-key-here')
```

## 📱 Mobile Optimization

- Separate mobile photo directory for optimized images
- Touch-enabled carousel with swipe gestures
- Hamburger menu for mobile navigation
- Progressive typography scaling

## 🔧 Development

### File Structure Guidelines
- **Photos**: Use descriptive filenames with category prefixes
- **CSS**: Mobile-first approach with progressive enhancement
- **JavaScript**: Vanilla JS for performance, GSAP for animations

### Testing Locally
```bash
# Run in development mode
export FLASK_ENV=development
python app.py
```

## 📄 API Endpoints

- `GET /` - Home page
- `GET /about` - About page
- `GET /portfolio` - Portfolio gallery
- `GET /contact` - Contact form
- `GET /api/photos?variant=desktop|mobile` - JSON photo list
- `GET /photos/<variant>/<filename>` - Serve photo
- `GET /view/<variant>/<filename>` - Full-size viewer

## 🚢 Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

### Heroku
1. Create `Procfile`:
```
web: gunicorn app:app
```
2. Deploy:
```bash
heroku create your-app-name
git push heroku main
```

### GitHub Pages (Static Export)
For static hosting, you'll need to export the site or use a service that supports Python.

## 📝 Environment Variables

- `FLASK_ENV` - Set to 'development' for debug mode
- `WEB3FORMS_KEY` - Your Web3Forms access key for contact form
- `PORT` - Server port (default: 5000)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email AllGasNoBrakes@tuta.com or open an issue on GitHub.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- GSAP for smooth animations
- Web3Forms for contact form handling
- Calendly for booking integration
- Flask community for excellent documentation

---

**Built with ❤️ for the automotive photography community**

*Last updated: October 2024*