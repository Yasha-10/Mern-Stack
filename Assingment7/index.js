const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const HttpError = require('./utils/http-error');
const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoute');
const dotenv = require('dotenv')
const port = 3078;

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Role');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
})

app.use("/api/v1/user", userRoute);
app.use("/api/v2/admin", adminRoute);


app.use((req, res, next) => {
    const error = new HttpError("Page Not Found", 404);
    throw error;
});

app.use((error, req, res, next) => {
    res.status(error.code);
    res.json({ message: error.message || "Unknown Erroe Occured", code: error.code });
});

dotenv.config();
mongoose.connect(`mongodb+srv://YashaGehlot:ixb4Ro970WBrMxOH@mernstackcluster.xhhfn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
`,

    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }).then(() => {
    app.listen(port, () => {
        console.log("server started");
    });

}).catch(err => {

    console.log(err);
});