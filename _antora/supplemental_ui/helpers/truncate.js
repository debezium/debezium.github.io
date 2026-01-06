module.exports = (str = '', len = 0) => {
    if (str.length > len) {
        return str.slice(0, len);
    } else {
        return str;
    }
}