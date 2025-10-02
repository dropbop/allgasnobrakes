from flask import Flask, render_template, send_from_directory, request, abort, redirect, url_for, jsonify
import os

# Define environment detection
IS_DEVELOPMENT = os.environ.get('FLASK_ENV') == 'development'

app = Flask(__name__)

@app.after_request
def add_security_headers(response):
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    return response

# 404 error handler - redirect to home page
@app.errorhandler(404)
def page_not_found(e):
    if IS_DEVELOPMENT:
        app.logger.error(f"404 error: {request.path}")
    return redirect(url_for('index'))

PHOTO_BASE = os.path.join(app.static_folder, 'photos')

def get_photo_category(filename):
    """Extract category from filename.
    Format: category-001-description.jpg
    Returns 'all' if no category prefix found."""
    categories = ['supercars', 'classic', 'sports', 'studio']
    filename_lower = filename.lower()

    for category in categories:
        if filename_lower.startswith(category + '-') or filename_lower.startswith(category + '_'):
            return category

    # Default category if no prefix found
    return 'all'

def list_photos(variant: str, exclude_about=True, with_categories=False):
    """Return sorted filenames for the variant's folder.
    If with_categories=True, returns list of (filename, category) tuples."""
    folder = os.path.join(PHOTO_BASE, variant)
    if not os.path.isdir(folder):
        return []
    files = [
        f for f in os.listdir(folder)
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.avif'))
    ]

    # Exclude about_me photos from portfolio listings by default
    if exclude_about:
        files = [f for f in files if 'about_me' not in f.lower()]

    files.sort()

    if with_categories:
        return [(f, get_photo_category(f)) for f in files]
    return files

@app.route('/')
def index():
    # Landing page with carousel (excluding about_me photos)
    mobile_photos = list_photos('mobile', exclude_about=True)
    return render_template('index.html',
                           mobile_photos=mobile_photos)

@app.route('/about')
def about():
    """About page with photographer story and background."""
    return render_template('about.html')

@app.route('/portfolio')
def portfolio():
    """Portfolio page with categorized photo galleries."""
    desktop_photos = list_photos('desktop', exclude_about=True, with_categories=True)
    mobile_photos = list_photos('mobile', exclude_about=True, with_categories=True)
    return render_template('portfolio.html',
                           desktop_photos=desktop_photos,
                           mobile_photos=mobile_photos)

@app.route('/contact')
def contact():
    """Contact page with booking form."""
    web3forms_key = os.environ.get('WEB3FORMS_KEY', '')
    return render_template('contact.html',
                           web3forms_key=web3forms_key)

@app.route('/api/photos')
def api_photos():
    """Return JSON list of photos for ?variant=desktop|mobile."""
    variant = (request.args.get('variant') or 'desktop').lower()
    if variant not in ('desktop', 'mobile'):
        return jsonify({'error': 'invalid variant'}), 400
    files = list_photos(variant, exclude_about=True)
    photos = [{
        'filename': f,
        'url': url_for('get_photo', variant=variant, filename=f),
        'view_url': url_for('view_image', variant=variant, filename=f)
    } for f in files]
    return jsonify({'variant': variant, 'count': len(photos), 'photos': photos})

@app.route('/photos/<variant>/<filename>')
def get_photo(variant, filename):
    if variant not in ('desktop', 'mobile'):
        abort(404)
    return send_from_directory(os.path.join(PHOTO_BASE, variant), filename)

@app.route('/view/<variant>/<filename>')
def view_image(variant, filename):
    if variant not in ('desktop', 'mobile'):
        abort(404)

    # Check if user came from portfolio or landing page
    referrer = request.args.get('from', 'portfolio')  # Default to portfolio
    back_url = url_for('portfolio') if referrer == 'portfolio' else url_for('index')

    return render_template('view_image.html',
                         variant=variant,
                         filename=filename,
                         back_url=back_url)

# Debug route to check environment variables - only available in development
@app.route('/debug')
def debug():
    if not IS_DEVELOPMENT:
        abort(404)
    web3forms_key = os.environ.get('WEB3FORMS_KEY', '')
    if web3forms_key:
        masked_key = web3forms_key[:5] + '***' if len(web3forms_key) > 5 else '***'
    else:
        masked_key = ''
    env_vars = {}
    for key, value in os.environ.items():
        if not key.lower().startswith(('secret_', 'api_', 'password', 'token', 'key')):
            env_vars[key] = value
        elif key.lower() == 'web3forms_key' and value:
            env_vars[key] = value[:5] + '***' if len(value) > 5 else '***'
    return render_template('debug.html',
                          web3forms_key=masked_key,
                          access_key_in_form=request.args.get('access_key', ''),
                          env_vars=env_vars)

# Vercel
app.config['STATIC_FOLDER'] = 'static'

if __name__ == "__main__":
    app.run(debug=IS_DEVELOPMENT)
