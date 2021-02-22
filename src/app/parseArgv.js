exports.parseArgv = function (_a) {
    var node = _a[0], file = _a[1], argv = _a.slice(2);
    var parsedArgs = {};
    argv.forEach(function (arg) {
        var _a = arg.split('='), key = _a[0], value = _a[1];
        parsedArgs[key] = value;
    });
    return parsedArgs;
    as;
    T;
};
