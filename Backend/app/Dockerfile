FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

# Install system 
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]