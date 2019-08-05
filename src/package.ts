import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import {spawnSync} from 'child_process';

export default class Package {
    meta: any;
    dir: string;
    name: string;
    main: string;
    mainPath: string;
    files: string[];
    static cache:any;
    constructor(meta: any, pkgPath: string) {
        this.meta = meta;
        this.dir = path.dirname(pkgPath);
        this.name = meta.name || this.nameFromDir(this.dir);
        this.main = this.getMain(meta.main, meta.browser);
        this.mainPath = path.resolve(this.dir, this.main);
    }
    getMain(main:string, browser:any):string{
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
    }
    nameFromDir(dir:string):string{
        let name = path.basename(dir);
        let parent = path.dirname(dir);
        let scope = path.basename(parent);
        return scope[0] === '@' ? scope + '/' + name : name;
    }
    getFiles(){
        if (this.files) {
            return this.files;
        }
        const prefix = this.dir + path.sep;
        this.files = Package
            .getDependencies(this.mainPath)
            .filter((fullname:string):boolean => fullname.indexOf(prefix) === 0);
        return this.files;
    }
    static getDependencies(entry:string):string[]{
        let bin = require.resolve('madge/bin/cli');
        let result = spawnSync('node', [bin, entry, '--json']);
        if (result.status === 1) {
            throw result.error || new Error(String(result.stderr) || String(result.stdout));
        }
        let stdout:string = String(result.stdout);
        let graph:any;
        try {
            graph = JSON.parse(stdout);
        }
        catch (e) {
            /* eslint-disable-next-line */
            console.error('failed to parse dependencies', stdout);
            throw e;
        }
        let dirname = path.dirname(entry);
        return Object.keys(graph).map((file):string => path.resolve(dirname, file));
    }
    static getInstalledPackageDirs(modulesPath:string):string[]{
        let files = glob.sync('/{@*/*,*}/package.json', {root: modulesPath});
        return files.map(file => path.dirname(file));
    }
    static create(dir:string){
        const pkgPath = path.resolve(dir, 'package.json');
        let cache = Package.cache;
        if (cache[pkgPath]) {
            return cache[pkgPath];
        }
        let meta = Package.loadJson(pkgPath);
        cache[pkgPath] = new Package(meta, pkgPath);
        return cache[pkgPath];
    }
    static loadJson(file:string):any{
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
}
Package.cache = {};