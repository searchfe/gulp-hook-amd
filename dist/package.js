"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var glob = require("glob");
var child_process_1 = require("child_process");
var Package = /** @class */ (function () {
    function Package(meta, pkgPath) {
        this.meta = meta;
        this.dir = path.dirname(pkgPath);
        this.name = meta.name || this.nameFromDir(this.dir);
        this.main = this.getMain(meta.main, meta.browser);
        this.mainPath = path.resolve(this.dir, this.main);
    }
    Package.prototype.getMain = function (main, browser) {
        main = main || 'index.js';
        if (!browser) {
            return main;
        }
        if (typeof browser === 'string') {
            return browser;
        }
        if (browser.main) {
            return browser.main;
        }
        return main;
    };
    Package.prototype.nameFromDir = function (dir) {
        var name = path.basename(dir);
        var parent = path.dirname(dir);
        var scope = path.basename(parent);
        return scope[0] === '@' ? scope + '/' + name : name;
    };
    Package.prototype.getFiles = function () {
        if (this.files) {
            return this.files;
        }
        var prefix = this.dir + path.sep;
        this.files = Package
            .getDependencies(this.mainPath)
            .filter(function (fullname) { return fullname.indexOf(prefix) === 0; });
        return this.files;
    };
    Package.getDependencies = function (entry) {
        var bin = require.resolve('madge/bin/cli');
        var result = child_process_1.spawnSync('node', [bin, entry, '--json']);
        if (result.status === 1) {
            throw result.error || new Error(String(result.stderr) || String(result.stdout));
        }
        var stdout = String(result.stdout);
        var graph;
        try {
            graph = JSON.parse(stdout);
        }
        catch (e) {
            /* eslint-disable-next-line */
            console.error('failed to parse dependencies', stdout);
            throw e;
        }
        var dirname = path.dirname(entry);
        return Object.keys(graph).map(function (file) { return path.resolve(dirname, file); });
    };
    Package.getInstalledPackageDirs = function (modulesPath) {
        var files = glob.sync('/{@*/*,*}/package.json', { root: modulesPath });
        return files.map(function (file) { return path.dirname(file); });
    };
    Package.create = function (dir) {
        var pkgPath = path.resolve(dir, 'package.json');
        var cache = Package.cache;
        if (cache[pkgPath]) {
            return cache[pkgPath];
        }
        var meta = Package.loadJson(pkgPath);
        cache[pkgPath] = new Package(meta, pkgPath);
        return cache[pkgPath];
    };
    Package.loadJson = function (file) {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    };
    return Package;
}());
exports.default = Package;
Package.cache = {};
