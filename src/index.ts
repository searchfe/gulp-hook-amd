import Parser from './parser';
import { Transform } from 'gulp-transform-cache';
import { File, PluginError } from 'gulp-util';
export { amdUrlParser } from './amdUri';
class ApmParser extends Transform {}
export function apmParser (option: ApmParserOpiton) {
    const parser = Parser.create(option.projectPath, option.modulesPath);
    return new ApmParser({
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

interface ApmParserOpiton {
    projectPath: string
    modulesPath?: string
}
