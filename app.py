from flask import Flask, render_template, send_from_directory, request
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

# Debug route to check environment variables
@app.route('/debug')
def debug():
    # Get Web3Forms key from environment variable
    web3forms_key = os.environ.get('WEB3FORMS_KEY', '')
    
    # Check if a form on the page has the access_key filled in
    access_key_in_form = request.args.get('access_key', '')
    
    # Get all environment variables (for debugging only)
    env_vars = {}
    for key, value in os.environ.items():
        # Skip sensitive environment variables 
        if not key.lower().startswith(('secret_', 'api_', 'password', 'token')):
            env_vars[key] = value
    
    return render_template('debug.html', 
                          web3forms_key=web3forms_key,
                          access_key_in_form=access_key_in_form,
                          env_vars=env_vars)

# This is needed for Vercel
app.config['STATIC_FOLDER'] = 'static'

# For local development only
if __name__ == "__main__":
    app.run(debug=False)