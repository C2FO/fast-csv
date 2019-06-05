/* eslint-disable @typescript-eslint/camelcase */
import { resolve } from 'path';
import { EOL } from 'os';


export default {
    path: resolve(__dirname, 'tmp', 'empty_rows.csv'),

    content: [
        'first_name,last_name,email_address',
        '"","",""',
        '"","",""',
        '"","",',
        '"",,""',
        ',,',
        '',
    ].join(EOL),

    parsed: [
        {
            first_name: '',
            last_name: '',
            email_address: '',
        },
        {
            first_name: '',
            last_name: '',
            email_address: '',
        },
        {
            first_name: '',
            last_name: '',
            email_address: '',
        },
        {
            first_name: '',
            last_name: '',
            email_address: '',
        },
        {
            first_name: '',
            last_name: '',
            email_address: '',
        },
    ],
};
