import express from 'express';

import { requireAuth } from '../middlewares/middlewares_auth.js';
import { Message } from '../models.js';
import { MessagesTable } from '../database.js';
import { respondBadRequest } from '../responses.js';
import * as errors from '../errors.js';
import { validateInt, validateString } from '../input_validation.js';

const router = express.Router();

async function handleGetMessages(req, res) {
    const since = req.query.since;
    const sinceNumber = Number(since);
    if (since !== undefined && !validateInt(sinceNumber, 0)) {
        respondBadRequest(res, errors.BAD_SINCE_PARAM);
        return;
    }

    let history;
    if (since === undefined)
        history = await new MessagesTable().fetchAll();
    else
        history = await new MessagesTable().fetchSince(sinceNumber);

    const body = {
        messages: history,
        ok: true,
    }

    res.status(200).json(body);
}

async function handlePostMessages(req, res) {
    const messageBody = req.body.message?.body;
    if (!validateString(messageBody, 1, 1024)) {
        respondBadRequest(res, errors.BAD_BODY_PARAM);
        return;
    }
    const user = req.user;
    const message = new Message(
        null,
        null,
        user.name,
        new Date().toUTCString(),
        messageBody,
    );
    await new MessagesTable().insert(message);
    const body = {
        message: message,
        ok: true,
    };
    res.status(200).json(body);
}

router.route('')
    .get(handleGetMessages)
    .post(requireAuth, handlePostMessages);

export default router;
