import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';

const app = express();
app.use(bodyParser.json());

const mongoURI = 'mongodb+srv://yogesh_d:yogesh890@tradingdb.m930es0.mongodb.net/keys';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

app.use('/', userRoutes);

app.listen(3000, () => {
  console.log("Server running !");
});
