import { resolve } from 'path';
import { EOL } from 'os';
import { PathAndContent } from './helpers';

export const malformed: PathAndContent<never> = {
    path: resolve(__dirname, 'tmp', 'malformed.csv'),

    content: [
        'first_name,last_name,email_address,address',
        '"First1"a   ", Last1 ,email1@email.com,"1 Street St, State ST, 88888"',
        'First2,Last2,email2@email.com,"2 Street St, State ST, 88888"',
    ].join(EOL),

    parsed: [],
};
