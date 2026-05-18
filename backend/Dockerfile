# Use official Python runtime as base image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV FLASK_ENV production

# Set work directory
WORKDIR /app

# Install system dependencies (needed for psycopg2 and other tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Expose port
EXPOSE 5000

# Run gunicorn
CMD ["gunicorn", "run:app", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120"]
