# Для создание USER
`curl -X POST -H "Content-Type: application/json" -d '{
"email": "admin@gmail.com",
"password": "tete9291",
"passwordRepeat": "tete9291"
}' http://localhost:3000/api/auth/register`

# 1. Команда для создания дампа:

`docker-compose exec postgres pg_dump -U postgres kmgav2 > /var/www/kmgasurvey.kz/backups/backup_$(date +%Y-%m-%d_%H-%M).sql`

# 2. Команда для восстановления:

`cat /var/www/kmgasurvey.kz/backups/backup_2023-12-31.sql | docker-compose exec -T postgres psql -U postgres kmgav2`

# 3. Автоматизация через cron (ежедневный бэкап в 2:00):

# `crontab -e`

### Добавьте строку (замените /path/to/docker-compose.yml на реальный путь)
`0 2 * * * /usr/bin/docker-compose -f /path/to/your/docker-compose.yml exec postgres pg_dump -U postgres kmgav2 > /var/www/kmgasurvey.kz/backups/backup_$(/bin/date +\%Y-\%m-\%d_\%H-\%M).sql 2>> /var/www/kmgasurvey.kz/backups/backup_errors.log`

0 2 * * * /usr/bin/docker-compose -f /home/kmgasul/kmga-nest/docker-compose.yml exec postgres pg_dump -U postgres kmgav2 > /var/www/kmgasurvey.kz/backups/backup_$(date +\%Y-\%m-\%d_\%H-\%M).sql