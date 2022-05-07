const {
   DB_HOST,
   DB_PORT,
   DB_USERNAME,
   DB_PASSWORD,
   DB_DATABASE
} = process.env;

module.exports = {
   "type": "mysql",
   "host": DB_HOST,
   "port": DB_PORT,
   "username": DB_USERNAME,
   "password": DB_PASSWORD,
   "database": DB_DATABASE,
   "synchronize": true,
   "logging": false,
   "entities": [
      "app/models/*.js"
   ],
   "migrations": [
      "app/migrations/*.js"
   ],
   "cli": {
      "entitiesDir": "app/models",
      "migrationsDir": "app/migrations"
   },
   "subscribers": [
       "app/subscribers/*.js"
   ]
}
