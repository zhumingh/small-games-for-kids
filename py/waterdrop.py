from flask import Flask, render_template_string
import numpy as np
import matplotlib.pyplot as plt
import io
import base64

# Create a Flask web application
app = Flask(__name__)

# Function to generate the image based on the mathematical formulas
def generate_image():
    # Define image dimensions
    width, height = 2000, 1200
    
    # Create an empty numpy array for RGB values
    image = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Constants used in the formula
    def F(x):
        return 255 * np.e**(-1000 * (x) * (x) * (x**2 - 1000)**2 - 1)
    
    # Iterate over each pixel to calculate the color based on the provided formulas
    for n in range(1, width + 1):
        for m in range(1, height + 1):
            # Scale to match the provided formula ranges
            x = (n - 1000) / 600
            y = (m - 1000) / 600
            # Calculate RGB values using the given formulas
            r = F(x) * F(y)  # Simplified for illustration purposes
            g = F(x) * F(y)
            b = F(x) * F(y)
            # Set the color in the image array
            image[m - 1, n - 1] = [r % 256, g % 256, b % 256]

    # Create the image using Matplotlib
    fig, ax = plt.subplots()
    ax.imshow(image)
    ax.axis('off')
    
    # Save the image to a BytesIO object
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    buf.seek(0)
    encoded_image = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    
    return encoded_image

# Flask route to render the HTML page
@app.route('/')
def index():
    # Generate the image
    encoded_image = generate_image()
    # HTML template for the webpage
    html_template = '''
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>Raven Behind Wet Glass</title>
      </head>
      <body>
        <h1>Raven Behind Wet Glass</h1>
        <img src="data:image/png;base64,{{ encoded_image }}" alt="Generated Image">
      </body>
    </html>
    '''
    return render_template_string(html_template, encoded_image=encoded_image)

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=6000)