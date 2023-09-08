const express = require('express');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const { testDbConnection } = require('./db/db');

testDbConnection();

// server
const app = express();
app.use(express.json());

// enable cors for http://localhost:3000
const corsOption = {
    origin: 'http://localhost:3000',
    methods: 'GET, POST, DELETE'
};
app.use(cors(corsOption));

// routes
app.use('/', userRoute);

// Error handling middleware
app.use((err, req, res, next) => {
    console.log("Hello")
    res.status(err.status || 500).json({ msg: err.message || "Internal Server Error" });
});

app.listen(3002, () => {
    console.log('Server is running on http://localhost:3002')
});