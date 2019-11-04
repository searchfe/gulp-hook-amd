import * as crypto from 'crypto';
import { Transform } from 'readable-stream';
import { File, PluginError } from 'gulp-util';
import * as fs from 'fs';
import * as path from 'path';
import * as parseJson from 'fast-json-parse';
function getFileDataFromResourceMap(key: string, sourceMapPath: string): any {
    console.time('apm read source');
    key = path.relative(process.cwd(), key);
    if (fs.existsSync(sourceMapPath)) {
        const fileContent = fs.readFileSync(sourceMapPath, 'utf-8');
        const fileObj = parseJson(fileContent || '{}');
        console.timeEnd('apm read source');
        return fileObj[key] ? fileObj[key] : {};
    }
    console.timeEnd('apm read source');
    return {};
}

function getMd5 (filePath:string, sourceMapPath:string, len?:number):string {
    if (!filePath) { return ''; }
    if (getFileDataFromResourceMap(filePath, sourceMapPath).md5) {
        return getFileDataFromResourceMap(filePath, sourceMapPath).md5;
    }
    if (fs.existsSync(path.resolve(process.cwd(), filePath))) {
        if (len === void 0) { len = 7; }
        const md5sum = crypto.createHash('md5');
        md5sum.update(fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8'), 'utf8');
        return md5sum.digest('hex').substring(0, len);
    }
    return '';
}
export function amdUrlParser (options:any) {
    return new Transform({
        objectMode: true,
        transform: (file: File, enc, callback: Function) => {
            if (file.isNull()) {
                this.emit('error', new PluginError('files can not be empty'));
                callback(null, file);
            }
            let content: string = file.contents.toString();
            if (process.env.dev) {
                content = content.replace('//m.baidu.com', '');
            }
            content = content.replace(/__getAmdUri\s*\(\s*('|")(.+)\1\s*\)/ig, function (all, quote, value) {
                let tmpPath = 'src' + value;
                const hash = getMd5(tmpPath, options.sourceMapPath);
                tmpPath = '.' + value.replace('.js', '_').replace('.css', '_');
                return quote + tmpPath + hash + quote;
            });
            file.contents = Buffer.from(content);
            callback(null, file);
        }
    });
}
