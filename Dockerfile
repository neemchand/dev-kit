FROM devopsfnl/image:php-8.2.11-np

WORKDIR /var/www/html

COPY . /var/www/html

RUN composer dump-autoload
RUN composer install --no-progress
RUN npm install
RUN npm run build
