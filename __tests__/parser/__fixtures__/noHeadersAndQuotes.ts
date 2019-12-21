import { resolve } from 'path';
import { EOL } from 'os';

export default {
    path: resolve(__dirname, 'tmp', 'no_headers_and_quotes.csv'),

    content: [
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
        ['First1', 'Last1', 'email1@email.com', '1 Street St, State ST, 88888'],
        ['First2', 'Last2', 'email2@email.com', '2 Street St, State ST, 88888'],
        ['First3', 'Last3', 'email3@email.com', '3 Street St, State ST, 88888'],
        ['First4', 'Last4', 'email4@email.com', '4 Street St, State ST, 88888'],
        ['First5', 'Last5', 'email5@email.com', '5 Street St, State ST, 88888'],
        ['First6', 'Last6', 'email6@email.com', '6 Street St, State ST, 88888'],
        ['First7', 'Last7', 'email7@email.com', '7 Street St, State ST, 88888'],
        ['First8', 'Last8', 'email8@email.com', '8 Street St, State ST, 88888'],
        ['First9', 'Last9', 'email9@email.com', '9 Street St, State ST, 88888'],
    ],
};
