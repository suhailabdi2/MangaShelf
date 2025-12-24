const crypto = require("crypto");

function generateSecret(){
    const secret = crypto.randomBytes(64).toString('hex');
    console.log(secret);
}
generateSecret();