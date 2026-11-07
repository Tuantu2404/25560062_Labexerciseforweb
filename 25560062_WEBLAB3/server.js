const express = require('express');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(express.json());

// Gắn prefix /api/v1
app.use('/api/v1', orderRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});