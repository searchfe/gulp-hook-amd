import * as crypto from 'crypto';
import { Transform } from 'readable-stream';
import { File, PluginError } from 'gulp-util';
import * as fs from 'fs';
import * as path from 'path';
function getFileDataFromResourceMap(key:string, sourceMapPath:string):any {
    key = key.indexOf('www-wise/') !== -1 ? key.split('www-wise/')[1] : key;
    if (fs.existsSync(sourceMapPath)) {
        var fileContent = fs.readFileSync(sourceMapPath, 'utf-8');
        var fileObj = JSON.parse(fileContent ? fileContent : '{}');
        return fileObj[key] ? fileObj[key] : {};
    }
    return {};
}

function getMd5(filePath:string, sourceMapPath:string, len?:number):string {
    if (!filePath) { return '';} 
    if(getFileDataFromResourceMap(filePath, sourceMapPath).md5){
        return getFileDataFromResourceMap(filePath, sourceMapPath).md5;
    }
    if (fs.existsSync(path.resolve(process.cwd(), filePath))) {
        if (len === void 0) { len = 7; }
        var md5sum = crypto.createHash('md5');
        md5sum.update(fs.readFileSync(path.resolve(process.cwd(), filePath),'utf-8'), 'utf8');
        return md5sum.digest('hex').substring(0, len);
    }
    return '';
}
export function amdUrlParser(options:any){
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
                let hash = getMd5(tmpPath, options.sourceMapPath);
                tmpPath = '.' + value.replace('.js', '_').replace('.css', '_')
                return quote + tmpPath + hash + quote;
            });
            file.contents = Buffer.from(content);
            callback(null, file);
        }
    });
}