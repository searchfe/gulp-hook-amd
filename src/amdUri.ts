import * as crypto from 'crypto';
import { Transform } from 'readable-stream';
import { File, PluginError } from 'gulp-util';

function getMd5(data: string, len: number = 7) {
    let md5sum = crypto.createHash('md5');
    md5sum.update(data, 'utf8');
    return md5sum.digest('hex').substring(0, len);
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
                var tmpPath = '.' + value.replace('.js', '_').replace('.css', '_');
                var hash = getMd5(value);
                return quote + tmpPath + hash + quote;
            });
            file.contents = Buffer.from(content);
            callback(null, file);
        }
    });
}