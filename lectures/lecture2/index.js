'use strict'

import {createServer} from 'http';
import {URL} from 'node:url';

import {Messenger, MessageSent} from './messenger.js';

const host = 'localhost';
const port = 8000;
const baseUrl = `http://${host}:${port}`;

const messenger = new Messenger();

function handleGetMessages(request, response) {
    const sinceStr = new URL(request.url, baseUrl).searchParams.get('since');
    let since = null;
    if (sinceStr != null) {
        try {
            since = Number(sinceStr);
        } catch (e) {
            since = null;
        }
    }
    if (since !== null && (typeof(since) !== 'number' || since < 0)) {
        return new Promise((resolve, reject) => {
            resolve([400, null]);
        });
    }

    const responseBody = {
        "messages": messenger.history(since)
    };

    return new Promise((resolve, reject) => {
        resolve([200, responseBody]);
    });
}

function handlePostMessage(request, response) {
    return new Promise((resolve, reject) => {
        const bodyChunks = [];
        request.on('data', (data) => {bodyChunks.push(data);});
        request.on('end', () => {
            const requestBody = Buffer.concat(bodyChunks).toString();
            let requestBodyJson;
            try {
                requestBodyJson = JSON.parse(requestBody);
            } catch (e) {
                requestBodyJson = null;
            }
            let messageJson;
            if (typeof(requestBodyJson) !== 'object' || !('message' in requestBodyJson)) {
                messageJson = null    
            } else {
                messageJson = requestBodyJson['message'];
            }
            const messageSent = MessageSent.tryParse(messageJson);
            if (messageSent !== null) {
                const messageReceived = messenger.receive(messageSent);
                const responseBody = {
                    "message": messageReceived
                }
                resolve([200, responseBody]);
            } else {
                resolve([400, null]);
            }
        });
    });
}

function error404(request, response) {
    return new Promise((resolve, reject) => {
        resolve([404, null]);
    });
}

function handleOptions(request, response) {
    return new Promise((resolve, reject) => {
        resolve([204, null]);
    });
}

function addCorsHeaders(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    if (request.method === 'OPTIONS') {
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        response.setHeader('Access-Control-Allow-Headers', '*');
    }
}

function handleRequest(request, response) {
    const method = request.method;
    const url = new URL(request.url, baseUrl);
    let handler;
    if (method === 'GET' && url.pathname == '/api/messages') {
        handler = handleGetMessages;
    } else if (method === 'POST' && url.pathname == '/api/messages') {
        handler = handlePostMessage;
    } else if (method === 'OPTIONS') {
        handler = handleOptions; 
    } else {
        handler = error404;
    }
    handler(request, response).then(
        ([statusCode, body]) => {
            addCorsHeaders(request, response);
            if (body !== null)
                response.setHeader('Content-Type', 'application/json');
            response.writeHead(statusCode);
            if (body !== null)
                response.end(JSON.stringify(body));
            else
                response.end();
            console.log(`${request.method} ${request.url} ${statusCode}`);
        }
    );
}

const server = createServer();
server.on('request', handleRequest);
server.on('listening', () => {
    console.log(`Server is listening on ${baseUrl}`);
});
server.listen(port, host);
