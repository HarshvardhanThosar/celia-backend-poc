# Use the official Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install dependencies first (cache layers)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Install watchfiles for live reload
RUN pip install watchfiles

# Expose FastAPI default port
EXPOSE 8000

# Run with watchfiles for auto-restart on code change
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]