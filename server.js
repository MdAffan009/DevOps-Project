const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app')

dotenv.config();


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => {
    console.log('DB connection failed:', err);
    process.exit(1);
  });
