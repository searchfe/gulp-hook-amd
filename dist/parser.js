"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var package_1 = require("./package");
var SEP = new RegExp('\\' + path.sep, 'g');
var defaultPath2url = function (x) { return JSON.stringify(x.replace(/\.js$/, '')); };
var singleton;
var Parser = /** @class */ (function () {
    function Parser(projectPath) {
        this.modulesPath = this.resolveModulesPath(projectPath);
        this.projectPath = path.resolve(projectPath);
    }
    Parser.prototype.resolveModulesPath = function (projectPath) {
        var filepath = this.findPackageJson(projectPath);
        if (!filepath) {
            return path.resolve(projectPath, 'amd_modules');
        }
        var pkg = package_1.default.loadJson(filepath);
        var relativePath = pkg.amdPrefix || 'amd_modules';
        return path.resolve(filepath, '..', relativePath);
    };
    Parser.prototype.findPackageJson = function (dir) {
        var pathname = path.resolve(dir, 'package.json');
        if (fs.existsSync(pathname)) {
            return pathname;
        }
        var parent = path.resolve(dir, '..');
        if (parent === dir) {
            return null;
        }
        return this.findPackageJson(parent);
    };
    Parser.prototype.inModules = function (fullname) {
        return fullname.indexOf(this.modulesPath) === 0;
    };
    Parser.prototype.isEntryFile = function (fullname) {
        if (!this.inModules(fullname)) {
            return false;
        }
        if (path.extname(fullname) !== '.js') {
            return false;
        }
        // fullname: /Users/harttle/test/amd_modules/ralltiir.js
        // relative: ralltiir
        var relative = fullname.slice(this.modulesPath.length + 1, -3);
        var tokens = relative.split('/');
        if (tokens.length > 2) {
            return false;
        }
        if (tokens.length === 2) {
            return relative[0] === '@' ? relative : false;
        }
        return relative;
    };
    Parser.prototype.inlinePackage = function (id, fileObj) {
        var file = path.resolve(this.modulesPath, id) + '.js';
        var relative = this.relativePath(file);
        if (fileObj.cache) {
            fileObj.cache.addDeps(file);
        }
        return '__inline(' + JSON.stringify(relative) + ');';
    };
    Parser.prototype.inlineDependencies = function (pkgName, fileObj) {
        var _this = this;
        var pkgPath = path.resolve(this.modulesPath, pkgName);
        var pkg = package_1.default.create(pkgPath);
        var inlines = pkg.getFiles();
        if (fileObj.cache) {
            inlines.forEach(function (filepath) { return fileObj.cache.addDeps(filepath); });
        }
        var text = inlines
            .map(function (file) { return _this.relativePath(file); })
            .map(function (path) { return '__inline(' + JSON.stringify(path) + ');'; })
            .join('\n');
        return text;
    };
    Parser.prototype.parse = function (content, file, settings) {
        var _this = this;
        var pkgName = this.isEntryFile(file.path);
        if (pkgName) {
            return this.inlineDependencies(pkgName, file) + '\n' + content + ';';
        }
        return content
            .replace(/__inlinePackage\(['"](.*)['"]\)/g, function (match, id) { return _this.inlinePackage(id, file); })
            .replace(/__AMD_CONFIG/g, function () { return _this.amdConfig(settings.path2url, file); });
    };
    Parser.create = function (projectPath) {
        if (!singleton) {
            singleton = new Parser(projectPath);
        }
        return singleton;
    };
    Parser.prototype.amdConfig = function (path2url, fileObj) {
        var _this = this;
        path2url = path2url || defaultPath2url;
        var lines = package_1.default.getInstalledPackageDirs(this.modulesPath)
            .map(function (dir) {
            var file = dir + '.js';
            if (fileObj.cache) {
                fileObj.cache.addDeps(file);
            }
            var relativePath = _this.relativePath(file);
            var url = path2url(relativePath);
            var id = _this.amdID(file);
            return "    \"" + id + "\": " + url;
        });
        return '{\n' + lines.join(',\n') + '\n}';
    };
    Parser.prototype.relativePath = function (fullpath) {
        return fullpath.replace(this.projectPath, '').replace(SEP, '/');
    };
    Parser.prototype.amdID = function (fullpath) {
        return fullpath.replace(this.modulesPath, '')
            .replace(/\.js$/, '')
            .replace(SEP, '/')
            .replace(/^\//, '');
    };
    return Parser;
}());
exports.default = Parser;
