from flask import Flask, render_template
import os

app = Flask(__name__)

@app.after_request
def add_security_headers(response):
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    return response

@app.route('/')
def index():
    photo_dir = os.path.join(app.static_folder, 'photos')
    photos = [f for f in os.listdir(photo_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
    photos.sort()
    return render_template('index.html', photos=photos)

if __name__ == "__main__":
    app.run(debug=False)