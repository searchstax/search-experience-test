FROM python:3.10-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ gcc \
    && rm -rf /var/lib/apt/lists/* \
    && pip install cryptography

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy worker code
WORKDIR /app
COPY . /app

CMD ["python", "worker.py"]
