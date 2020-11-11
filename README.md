# TinyHouse Project
Сайт, позволяющий людям авторизироваться с помощью Google, размещать объявления о сдаче жилья, а также бронировать уже доступные на платформе дома и квартиры.

## Инструкция
 * Запуск сервера - из папки `./server` выполнить скрипт `npm start`, GraphQL API будет доступен по адресу [http://localhost:9000/api]
 * Запуск клиента - из папки `./client` выполнить скрипт `npm start`, клиентское приложение будет доступно по адресу [http://localhost:3000]

## Важно
 * Чтобы создавать позиции на платформе необходима авторизация
 * Чтобы арендовать какое-либо помещение необходимо иметь привязанный __Stripe__-аккаунт (как арендатору, так и арендующему)
 * Представленные на сайте позиции - мок, однако свои создать можно
 * Stripe подключен в тестовом режиме. Для проверки работоспособности аренды можно использовать фейковую платежную информацию __4242 4242 4242 4242 4/24 242__
