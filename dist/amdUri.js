"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var readable_stream_1 = require("readable-stream");
var gulp_util_1 = require("gulp-util");
function getMd5(data, len) {
    if (len === void 0) { len = 7; }
    var md5sum = crypto.createHash('md5');
    md5sum.update(data, 'utf8');
    return md5sum.digest('hex').substring(0, len);
}
function amdUrlParser(options) {
    var _this = this;
    return new readable_stream_1.Transform({
        objectMode: true,
        transform: function (file, enc, callback) {
            if (file.isNull()) {
                _this.emit('error', new gulp_util_1.PluginError('files can not be empty'));
                callback(null, file);
            }
            var content = file.contents.toString();
            if (process.env.dev) {
                content = content.replace('//m.baidu.com', '');
            }
            content = content.replace(/__getAmdUri\s*\(\s*('|")(.+)\1\s*\)/ig, function (all, quote, value) {
                var tmpPath = '.' + value.replace('.js', '_').replace('.css', '_');
                var hash = getMd5(value);
                console.log(quote + tmpPath + hash + quote, tmpPath, hash, quote);
                return quote + tmpPath + hash + quote;
            });
            file.contents = Buffer.from(content);
            callback(null, file);
        }
    });
}
exports.amdUrlParser = amdUrlParser;
