import console from 'node:console';

function accessLog(req, res, next) {
    res.on('close', handleResponseClose);
    next();
}

function handleResponseClose() {
    console.log(
        new Date().toUTCString(),
        this.req.socket.remoteAddress,
        this.req.socket.remotePort,
        this.req.method,
        this.req.baseUrl
            ? this.req.baseUrl + this.req.url
            : this.req.url,
        this.statusCode
    );
}

export { accessLog };
