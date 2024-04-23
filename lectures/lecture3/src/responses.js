function respondBadRequest(res, error, statusCode=400) {
    const body = {
        ok: false,
        error: error,
    };
    res.status(statusCode).json(body);
}

function respondOk(res) {
    const body = {ok: true};
    res.status(200).json(body);
}

export { respondBadRequest, respondOk };
