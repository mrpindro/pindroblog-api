require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const { logger, logEvents } = require('./middleware/logger');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/db.Conn');
const mongoose = require('mongoose');
const PORT = process.env.PORT;

app.use(logger);

connectDB();

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'));
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));
app.use('/blogs', require('./routes/blogs'));

app.use('*', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ message: "404: Sorry, page not found!"})
    } else if (req.accepts('txt')) {
        res.send('404: Sorry, page not found!')
    }
})

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server Running at Port ${PORT}`));
})

mongoose.connection.on('error', err => {
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
})