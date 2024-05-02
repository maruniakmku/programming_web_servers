import { Buffer } from 'node:buffer';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const keyLength = 32;

function passwordHash(password) {
    return new Promise((resolve, reject) => {
        const salt = randomBytes(16).toString('hex');
        scrypt(password, salt, keyLength, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}/${derivedKey.toString('hex')}`);
        });
    });
};

function comparePasswordHash(password, hash) {
    return new Promise((resolve, reject) => {
        const [salt, providedDerivedKeyStr] = hash.split('/');
        const providedDerivedKey = Buffer.from(providedDerivedKeyStr, 'hex');
        scrypt(password, salt, keyLength, (err, derivedKey) => {
            if (err) reject(err);
            resolve(timingSafeEqual(providedDerivedKey, derivedKey));
        });
    });
};

export { passwordHash, comparePasswordHash };
