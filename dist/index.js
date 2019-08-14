"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("./parser");
var readable_stream_1 = require("readable-stream");
var gulp_util_1 = require("gulp-util");
var amdUri_1 = require("./amdUri");
exports.amdUrlParser = amdUri_1.amdUrlParser;
function apmParser(option) {
    var _this = this;
    var parser = parser_1.default.create(option.projectPath);
    return new readable_stream_1.Transform({
        objectMode: true,
        transform: function (file, enc, callback) {
            if (file.isNull()) {
                _this.emit('error', new gulp_util_1.PluginError('files can not be empty'));
                callback(null, file);
            }
            var content = file.contents.toString();
            content = parser.parse(content, file, option);
            file.contents = Buffer.from(content);
            callback(null, file);
        }
    });
}
exports.apmParser = apmParser;
;
