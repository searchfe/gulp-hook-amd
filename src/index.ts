import Parser from './parser';
import { Transform } from './cacheTransform';
import { File, PluginError } from 'gulp-util';
export { amdUrlParser } from './amdUri';

export function apmParser(option: any) {
    let parser = Parser.create(option.projectPath);
    return new Transform({
        objectMode: true,
        transform: (file: File, enc, callback: Function) => {
            if (file.isNull()) {
                this.emit('error', new PluginError('files can not be empty'));
                callback(null, file);
            }
            let content: string = file.contents.toString();
            content = parser.parse(content, file, option);
            file.contents = Buffer.from(content);
            callback(null, file);
        }
    });
};
