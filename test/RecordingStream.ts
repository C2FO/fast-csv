import { Writable } from 'stream';


export default class RecordingStream extends Writable {
    public readonly data: string[] = [];

    public constructor() {
        super({
            write: (data, enc, cb): void => {
                this.data.push(data.toString());
                cb();
            },
        });
    }
}
