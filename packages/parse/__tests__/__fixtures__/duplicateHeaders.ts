import { resolve } from 'path';
import { EOL } from 'os';

export const duplicateHeaders = {
    path: resolve(__dirname, 'tmp', 'duplicate_header.csv'),

    content: [
        'first_name,first_name,email_address,address',
        'First1,First1,email1@email.com,"1 Street St, State ST, 88888"',
    ].join(EOL),

    parsed: [],
};
