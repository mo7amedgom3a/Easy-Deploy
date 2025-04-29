FROM python:3.10-slim

WORKDIR /app

# Define build arguments
ARG PORT=5000
ARG APP_NAME=app.py

# Set environment variables from the arguments
ENV PORT=${PORT}
ENV APP_NAME=${APP_NAME}

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port from the arguments
EXPOSE ${PORT}

# Use the application name from the arguments
CMD ["sh", "-c", "python ${APP_NAME}"]
