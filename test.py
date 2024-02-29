from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
import pandas as pd

# PDF file path
pdf_path = '/home/atharva/Downloads/chart.pdf'

# Page number containing the graph (0-indexed)
page_number = 0

# Load the PDF using PdfReader
pdf_reader = PdfReader(pdf_path)
page = pdf_reader.pages[page_number]

# Convert the page content to bytes
page_content = bytes(page.get_pagecontent())

# Extract the image from the page content
img_start = page_content.find(b"/Im")
img_end = page_content.find(b"ID\n", img_start)
img_data = page_content[img_start:img_end]

# Convert the image data to a PIL Image
img = Image.open(io.BytesIO(img_data))

# Perform OCR on the image to get textual data (if any)
text = pytesseract.image_to_string(img)

# Process the text to extract data points (simplified example)
data_points = []
for line in text.split('\n'):
    if line.strip():  # Skip empty lines
        parts = line.split()
        if len(parts) == 2:
            x, y = parts
            data_points.append((float(x), float(y)))

# Create a pandas DataFrame
df = pd.DataFrame(data_points, columns=['X', 'Y'])

# Export the DataFrame to a CSV file
csv_path = '/home/atharva/Downloads/extracted_data.csv'
df.to_csv(csv_path, index=False)

print(f"Data extracted and saved to {csv_path}")
