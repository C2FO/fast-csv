/* eslint-disable @typescript-eslint/camelcase */
import { resolve } from 'path';
import { EOL } from 'os';
import { PathAndContent } from './helpers';
import { RowMap } from '../../src';

export const withHeadersAlternateDelimiter = (delimiter = '\t'): PathAndContent<RowMap> => ({
    path: resolve(__dirname, 'tmp', 'with_headers_alternate_delimiter.tsv'),

    content: [
        'first_name{delimiter}last_name{delimiter}email_address',
        'First1{delimiter}Last1{delimiter}email1@email.com',
        'First2{delimiter}Last2{delimiter}email2@email.com',
        'First3{delimiter}Last3{delimiter}email3@email.com',
        'First4{delimiter}Last4{delimiter}email4@email.com',
        'First5{delimiter}Last5{delimiter}email5@email.com',
        'First6{delimiter}Last6{delimiter}email6@email.com',
        'First7{delimiter}Last7{delimiter}email7@email.com',
        'First8{delimiter}Last8{delimiter}email8@email.com',
        'First9{delimiter}Last9{delimiter}email9@email.com',
    ]
        .map(r => r.replace(/{delimiter}/g, delimiter))
        .join(EOL),

    parsed: [
        {
            first_name: 'First1',
            last_name: 'Last1',
            email_address: 'email1@email.com',
        },
        {
            first_name: 'First2',
            last_name: 'Last2',
            email_address: 'email2@email.com',
        },
        {
            first_name: 'First3',
            last_name: 'Last3',
            email_address: 'email3@email.com',
        },
        {
            first_name: 'First4',
            last_name: 'Last4',
            email_address: 'email4@email.com',
        },
        {
            first_name: 'First5',
            last_name: 'Last5',
            email_address: 'email5@email.com',
        },
        {
            first_name: 'First6',
            last_name: 'Last6',
            email_address: 'email6@email.com',
        },
        {
            first_name: 'First7',
            last_name: 'Last7',
            email_address: 'email7@email.com',
        },
        {
            first_name: 'First8',
            last_name: 'Last8',
            email_address: 'email8@email.com',
        },
        {
            first_name: 'First9',
            last_name: 'Last9',
            email_address: 'email9@email.com',
        },
    ],
});
