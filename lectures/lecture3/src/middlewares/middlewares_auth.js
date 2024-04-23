import { UsersTable } from '../database.js';
import { respondBadRequest } from '../responses.js';
import * as errors from '../errors.js';

async function requireAuth(req, res, next) {
    const userId = req.session.userId;
    if (userId === undefined) {
        respondBadRequest(res, errors.NOT_AUTHENTICATED, 401);
    } else {
        const user = await new UsersTable().findById(userId);
        if (user === null) {
            req.session.destroy(() => {
                respondBadRequest(res, errors.NOT_AUTHENTICATED, 401);
            });
        } else {
            req.user = user;
            next();
        }
    }
}

export { requireAuth };