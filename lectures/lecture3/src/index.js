import console from 'node:console';

import express from 'express';
import session from 'express-session';

import { accessLog } from './middlewares/middlewares_logging.js';
import authRoutes from './routes/routes_auth.js';
import messagesRoutes from './routes/routes_messages.js'

const port = 8000;
const hostname = '127.0.0.1';

const app = express();

app.use(accessLog);

app.use(session({
    'cookie': {
        'httpOnly': true,
        'maxAge': 1000 * 60 * 60 * 24 * 7,  // one week in ms
        'path': '/',
        'sameSite': false,  // WARNING: Must be Lax in production
        'secure': false,  // WARNING: Must be true in production
    },
    'name': 'session',
    'resave': false,
    'saveUninitialized': false,
    'secret': 'TEST',  // WARNING: A secret in the code.
    'unset': 'destroy',
}));

app.get('/', (req, res) => {res.redirect('/docs/');});

app.use('/docs', express.static('../public/docs', {index: 'swaggerui.html'}));

app.use(express.json());

app.use('/api/messages', messagesRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, hostname, () => {
    console.log(`The server is listening on http://${hostname}:${port}`);
});
