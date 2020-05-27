import { Writable } from 'stream';

export class RecordingStream extends Writable {
    public readonly data: string[] = [];

    public constructor() {
        super({
            write: (data: Buffer, enc, cb): void => {
                this.data.push(data.toString());
                cb();
            },
        });
    }
}
