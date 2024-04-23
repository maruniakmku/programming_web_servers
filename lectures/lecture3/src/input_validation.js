function validateString(s, minLen, maxLen) {
    if (s === null || s === undefined)
        return false;
    if (typeof(s) !== 'string')
        return false;
    if (s.length < minLen)
        return false;
    if (s.length > maxLen)
        return false;
    return true;
}

function validateInt(i, minValue) {
    if (i === null || i === undefined)
        return false;
    if (typeof(i) !== 'number')
        return false;
    if (Math.round(i) !== i)
        return false;
    if (i < minValue)
        return false;
    return true;
}

export { validateString, validateInt };
