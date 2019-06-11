/* eslint-disable @typescript-eslint/camelcase */
import { resolve } from 'path';
import { EOL } from 'os';

export default {
    path: resolve(__dirname, 'tmp', 'with_headers_and_missing_columns.csv'),

    content: [
        'first_name,last_name,email_address,address',
        'First1,Last1,email1@email.com,address1',
        'First2,Last2,email2@email.com',
        'First3,Last3,email3@email.com,address2',
    ].join(EOL),

    parsed: [
        {
            first_name: 'First1',
            last_name: 'Last1',
            email_address: 'email1@email.com',
            address: 'address1',
        },
        {
            first_name: 'First2',
            last_name: 'Last2',
            email_address: 'email2@email.com',
            address: null,
        },
        {
            first_name: 'First3',
            last_name: 'Last3',
            email_address: 'email3@email.com',
            address: 'address2',
        },
    ],
};
