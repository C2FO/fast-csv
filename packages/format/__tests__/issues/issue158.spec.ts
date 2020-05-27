import * as csv from '../../src';
import { RecordingStream } from '../__fixtures__';

describe('Issue #158 - https://github.com/C2FO/fast-csv/issues/158', () => {
    class Place {
        public readonly id: number;

        public readonly name: string;

        public calculatedValue: number;

        public constructor(id: number, name: string) {
            this.id = id;
            this.name = name;
            this.calculatedValue = 0;
        }

        public calculateSomething() {
            this.calculatedValue = this.id * 2;
            return this;
        }
    }

    it('should not write prototype methods in csv', () => {
        return new Promise((res, rej) => {
            const rs = new RecordingStream();
            csv.write(
                [
                    new Place(1, 'a').calculateSomething(),
                    new Place(2, 'b').calculateSomething(),
                    new Place(3, 'c').calculateSomething(),
                ],
                { headers: true },
            )
                .pipe(rs)
                .on('error', rej)
                .on('finish', () => {
                    expect(rs.data.join('')).toBe('id,name,calculatedValue\n1,a,2\n2,b,4\n3,c,6');
                    res();
                });
        });
    });
});
