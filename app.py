from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

@app.after_request
def add_security_headers(response):
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    return response

@app.route('/')
def index():
    photo_dir = os.path.join(app.static_folder, 'photos')
    photos = [f for f in os.listdir(photo_dir) if f.endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    photos.sort()
    
    # Get Web3Forms key from environment variable
    web3forms_key = os.environ.get('WEB3FORMS_KEY', '')
    
    return render_template('index.html', photos=photos, web3forms_key=web3forms_key)

@app.route('/view/<filename>')
def view_image(filename):
    return render_template('view_image.html', filename=filename)

@app.route('/photos/<filename>')
def get_photo(filename):
    return send_from_directory(os.path.join(app.static_folder, 'photos'), filename)

# This is needed for Vercel
app.config['STATIC_FOLDER'] = 'static'

# For local development only
if __name__ == "__main__":
    app.run(debug=False)