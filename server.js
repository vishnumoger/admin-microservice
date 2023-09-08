const express = require('express');
const cors = require('cors');
const config = require('./config/development.json');
const app = express();

const fs = require('firebase-admin');
const serviceAccount = require('./key.json');

fs.initializeApp({
 credential: fs.credential.cert(serviceAccount)
});

app.use(cors())
app.use(express.json());

app.use(express.urlencoded({extended: true}));

const routes = require('./routes/index');

app.use('/api/admin', routes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`)
})