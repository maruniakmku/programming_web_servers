import express from 'express';

import * as errors from '../errors.js';
import { comparePasswordHash, passwordHash, } from '../password_hashing.js';
import { respondBadRequest, respondOk } from '../responses.js';
import { User } from '../models.js';
import { UsersTable } from '../database.js';
import { validateString } from '../input_validation.js';

const router = express.Router();

async function handleGetLogin(req, res) {
    if (req.session.userId === undefined) {
        respondBadRequest(res, errors.NOT_AUTHENTICATED, 401);
    } else {
        const user = await new UsersTable().findById(req.session.userId);
        if (user === null) {
            req.session.destroy(() => {
                respondBadRequest(res, errors.NOT_AUTHENTICATED);
            });
        } else {
            const body = {
                user: {
                    login: user.login,
                    name: user.name,
                },
                ok: true
            }
            res.status(200).json(body);
        }
    }
}

async function handlePostLogin(req, res) {
    const login = req.body.login;
    if (!validateString(login, 1, 100)) {
        respondBadRequest(res, errors.BAD_LOGIN_PARAM);
        return;
    }

    const password = req.body.password;
    if (!validateString(password, 8, 100)) {
        respondBadRequest(res, errors.BAD_PASSWORD_PARAM);
        return;
    }

    const user = await new UsersTable().findByLogin(login.toLowerCase());
    if (user === null) {
        respondBadRequest(res, errors.LOGIN_PASSWORD_DONT_MATCH);
    } else {
        const match = await comparePasswordHash(password, user.pwdhash);
        if (match) {
            req.session.regenerate(() => {
                req.session.userId = user.id;
                req.user = user;
                respondOk(res);
            });
        } else {
            respondBadRequest(res, errors.LOGIN_PASSWORD_DONT_MATCH);
        }
    }
}

function handlePostLogout(req, res) {
    req.session.destroy(() => {
        delete req.user;
        respondOk(res);
    });
}

async function handlePostSignup(req, res) {
    const login = req.body.login;
    if (!validateString(login, 3, 128)) {
        respondBadRequest(res, errors.BAD_LOGIN_PARAM);
        return;
    }

    const password = req.body.password;
    if (!validateString(password, 8, 128)) {
        respondBadRequest(res, errors.BAD_PASSWORD_PARAM);
        return;
    }

    const name = req.body.name;
    if (!validateString(name, 3, 128)) {
        respondBadRequest(res, errors.BAD_NAME_PARAM);
        return;
    }

    const pwdhash = await passwordHash(password);
    const user = new User(null, login.toLowerCase(), pwdhash, name);
    const inserted = await new UsersTable().tryInsert(user);
    if (inserted) {
        // https://owasp.org/www-community/attacks/Session_fixation
        req.session.regenerate(() => {
            req.session.userId = user.id;
            req.user = user;
            respondOk(res);
        });
    } else {
        respondBadRequest(res, errors.LOGIN_IS_NOT_AVAILABLE);
    }
}

router.route('/login')
    .get(handleGetLogin)
    .post(handlePostLogin);

router.post('/logout', handlePostLogout)

router.post('/signup', handlePostSignup);

export default router;
