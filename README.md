# hBuddy

## Hukam IoT Buddy

curl -d '{"title":"hBuddy Notification", "pushMsg":"There is someone at the main door", "registrationIds":["ebzeLu9zkfA:APA91bHX2bKk_9Fp6ghttuGSfCjuC8ra5KxJuRlPF8BPNlLWJdYHAwkwF-xubUWflK_eFwc1y_8WhK_ZFAhHKeeULK8Esu070RkLgdV6Waxjdf2yDTowvixgjLXe1tE40MSlNugRWJ1L"], "pushData":{}}' -H "Content-Type: application/json" -X POST http://www.hukamtechnologies.com/api/Notifications/notify

NGINX Related (On Mac Os)
sudo nano /usr/local/etc/nginx/nginx.conf

Start Command: sudo nginx
Reload Command: sudo nginx -s reload
Stop Command: sudo nginx -s stop

## How to run it locally using localtunnel:
lt --port 3000
