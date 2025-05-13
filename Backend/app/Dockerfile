FROM python:3.9-slim

WORKDIR /app

# Define build arguments
ARG CLIENT_ID
ARG CLIENT_SECRET
ARG CONNECTION_STRING
ARG DATABASE_NAME
ARG JWT_ALGORITHM
ARG JWT_SECRET_KEY
ARG EXPIRATION_TIME

# Set environment variables from build arguments
ENV CLIENT_ID=${CLIENT_ID}
ENV CLIENT_SECRET=${CLIENT_SECRET}
ENV CONNECTION_STRING=${CONNECTION_STRING}
ENV DATABASE_NAME=${DATABASE_NAME}
ENV JWT_ALGORITHM=${JWT_ALGORITHM}
ENV JWT_SECRET_KEY=${JWT_SECRET_KEY}
ENV EXPIRATION_TIME=${EXPIRATION_TIME}

COPY requirements.txt .

# Install system 
RUN pip3 install --no-cache-dir -r requirements.txt
# Install Git and other required packages
RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]