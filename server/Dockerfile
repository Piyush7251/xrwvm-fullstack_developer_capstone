    FROM python:3.12.0-slim-bookworm

    ENV PYTHONBUFFERED 1
    ENV PYTHONWRITEBYTECODE 1

    ENV APP=/app

    # Change the workdir.
    WORKDIR $APP

    # Install Node.js for building the React frontend
    RUN apt-get update && apt-get install -y curl && \
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
        apt-get install -y nodejs && \
        apt-get clean && rm -rf /var/lib/apt/lists/*

    # Install the requirements
    COPY requirements.txt $APP
    RUN pip3 install --upgrade pip && pip3 install -r requirements.txt

    # Copy the rest of the files
    COPY . $APP

    # Build React frontend
    RUN cd /app/frontend && npm install && npm run build

    EXPOSE 8000

    RUN chmod +x /app/entrypoint.sh

    ENTRYPOINT ["/bin/bash","/app/entrypoint.sh"]
    CMD ["gunicorn", "--bind", ":8000", "--workers", "3", "djangoproj.wsgi"]
