/* eslint-disable @typescript-eslint/camelcase */
import { resolve } from 'path';
import { EOL } from 'os';
import { PathAndContent } from './helpers';
import { RowMap } from '../../src';

export const withHeadersAndQuotes: PathAndContent<RowMap> = {
    path: resolve(__dirname, 'tmp', 'with_headers_and_quotes.csv'),

    content: [
        'first_name,last_name,email_address,address',
        'First1,Last1,email1@email.com,"1 Street St, State ST, 88888"',
        'First2,Last2,email2@email.com,"2 Street St, State ST, 88888"',
        'First3,Last3,email3@email.com,"3 Street St, State ST, 88888"',
        'First4,Last4,email4@email.com,"4 Street St, State ST, 88888"',
        'First5,Last5,email5@email.com,"5 Street St, State ST, 88888"',
        'First6,Last6,email6@email.com,"6 Street St, State ST, 88888"',
        'First7,Last7,email7@email.com,"7 Street St, State ST, 88888"',
        'First8,Last8,email8@email.com,"8 Street St, State ST, 88888"',
        'First9,Last9,email9@email.com,"9 Street St, State ST, 88888"',
    ].join(EOL),

    parsed: [
        {
            first_name: 'First1',
            last_name: 'Last1',
            email_address: 'email1@email.com',
            address: '1 Street St, State ST, 88888',
        },
        {
            first_name: 'First2',
            last_name: 'Last2',
            email_address: 'email2@email.com',
            address: '2 Street St, State ST, 88888',
        },
        {
            first_name: 'First3',
            last_name: 'Last3',
            email_address: 'email3@email.com',
            address: '3 Street St, State ST, 88888',
        },
        {
            first_name: 'First4',
            last_name: 'Last4',
            email_address: 'email4@email.com',
            address: '4 Street St, State ST, 88888',
        },
        {
            first_name: 'First5',
            last_name: 'Last5',
            email_address: 'email5@email.com',
            address: '5 Street St, State ST, 88888',
        },
        {
            first_name: 'First6',
            last_name: 'Last6',
            email_address: 'email6@email.com',
            address: '6 Street St, State ST, 88888',
        },
        {
            first_name: 'First7',
            last_name: 'Last7',
            email_address: 'email7@email.com',
            address: '7 Street St, State ST, 88888',
        },
        {
            first_name: 'First8',
            last_name: 'Last8',
            email_address: 'email8@email.com',
            address: '8 Street St, State ST, 88888',
        },
        {
            first_name: 'First9',
            last_name: 'Last9',
            email_address: 'email9@email.com',
            address: '9 Street St, State ST, 88888',
        },
    ],
};
