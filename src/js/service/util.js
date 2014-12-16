function extendClass(subClass, superClass) {
    var __ = function () {
    };
    __.prototype = new superClass();
    subClass.prototype = new __();
    subClass.prototype.constructor = subClass;
    subClass.prototype.super = superClass;
}

function extend(target, opt_src) {
    var srces = Array.prototype.slice.call(arguments, 1);
    srces.forEach(function (src) {
        if (!isObject(src)) return;
        Object.keys(src).forEach(function (key) {
            target[key] = src[key];
        });
    });

    return target
}

function isObject(exp) {
    return (typeof exp === 'object' && !!exp)
}
