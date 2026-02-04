const crypto = require('crypto');

// Generate RSA Key Pair (Simulated for Dealer registration)
exports.generateKeyPair = () => {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
};

// Sign Data (Dealer signs transaction)
exports.signData = (data, privateKey) => {
    const sign = crypto.createSign('SHA256');
    sign.update(JSON.stringify(data));
    sign.end();
    return sign.sign(privateKey, 'hex');
};

// Verify Signature (System/User verifies invoice)
exports.verifySignature = (data, signature, publicKey) => {
    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(data));
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
};
