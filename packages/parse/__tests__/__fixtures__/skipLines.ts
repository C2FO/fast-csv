/* eslint-disable @typescript-eslint/camelcase */
import { resolve } from 'path';
import { EOL } from 'os';
import { PathAndContent } from './helpers';
import { RowArray } from '../../src';

export const skipLines: PathAndContent<RowArray> = {
    path: resolve(__dirname, 'tmp', 'skip_lines.csv'),

    content: [
        'Skip First1,Last1,skip.email2@email.com',
        'Skip First2,Skip Last2,skip.email2@email.com',
        'First1,Last1,email1@email.com',
        'First2,Last2,email2@email.com',
        'First3,Last3,email3@email.com',
        'First4,Last4,email4@email.com',
        'First5,Last5,email5@email.com',
        'First6,Last6,email6@email.com',
        'First7,Last7,email7@email.com',
        'First8,Last8,email8@email.com',
        'First9,Last9,email9@email.com',
    ].join(EOL),

    parsed: [
        ['First1', 'Last1', 'email1@email.com'],
        ['First2', 'Last2', 'email2@email.com'],
        ['First3', 'Last3', 'email3@email.com'],
        ['First4', 'Last4', 'email4@email.com'],
        ['First5', 'Last5', 'email5@email.com'],
        ['First6', 'Last6', 'email6@email.com'],
        ['First7', 'Last7', 'email7@email.com'],
        ['First8', 'Last8', 'email8@email.com'],
        ['First9', 'Last9', 'email9@email.com'],
    ],
};
