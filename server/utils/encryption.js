const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

// Encryption Key (Must be 32 chars for AES-256)
const secretKey = process.env.AES_SECRET;

if (!secretKey || secretKey.length !== 32) {
    console.error("CRITICIAL ERROR: AES_SECRET must be exactly 32 caracters long in .env");
}

exports.encrypt = (text) => {
    const iv = crypto.randomBytes(16); // Generate new IV for every encryption
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // Store IV with encrypted data (iv:encrypted)
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

exports.decrypt = (text) => {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};


