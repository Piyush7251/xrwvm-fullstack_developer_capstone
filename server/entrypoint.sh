#!/bin/sh

echo "Making migrations and migrating the database."
python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings'); django.setup(); from django.contrib.auth.models import User; User.objects.filter(username='root').exists() or User.objects.create_superuser('root', 'root@example.com', 'root')"
exec "$@"
