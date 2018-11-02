var env = process.env.NODE_ENV || 'development';
console.log('env ****', env);

if (env === 'development') {
  process.env.PORT = 3030;
  process.env.MONGODB_URI =   `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}`, { useNewUrlParser: true });
} else if (env === 'test') {
  process.env.PORT = 3030;
  process.env.MONGODB_URI = '';
}
