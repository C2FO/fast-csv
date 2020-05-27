import { resolve } from 'path';
import { EOL } from 'os';
import { PathAndContent } from './helpers';
import { RowMap } from '../../src';

export const emptyRows: PathAndContent<RowMap> = {
    path: resolve(__dirname, 'tmp', 'empty_rows.csv'),

    content: ['first_name,last_name,email_address', '"","",""', '"","",""', '"","",', '"",,""', ',,', ''].join(EOL),

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
