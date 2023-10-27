web: gunicorn yogit-web-app.wsgi:application --log-file - --log-level debug
heroku run python manage.py collectstatic
heroku ps:scale web=1
python manage.py migrate