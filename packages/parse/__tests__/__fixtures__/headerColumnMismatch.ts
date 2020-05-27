import { resolve } from 'path';
import { EOL } from 'os';
import { PathAndContent } from './helpers';
import { RowMap } from '../../src';

export const headerColumnMismatch: PathAndContent<RowMap> = {
    path: resolve(__dirname, 'tmp', 'header_column_mismatch.csv'),

    content: [
        'first_name,last_name,email_address,address',
        'First1,Last1,email1@email.com,"1 Street St, State ST, 88888", extra column',
    ].join(EOL),

    parsed: [
        {
            first_name: 'First1',
            last_name: 'Last1',
            email_address: 'email1@email.com',
            address: '1 Street St, State ST, 88888',
        },
    ],
};
