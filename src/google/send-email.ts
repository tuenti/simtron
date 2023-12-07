import {init} from './auth';

const createEmail = (to: string, from: string, subject: string, message: string) => {
    var str = [
        'Content-Type: text/html; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        'to: ',
        to,
        '\n',
        'from: ',
        from,
        '\n',
        'subject: ',
        subject,
        '\n\n',
        message,
    ].join('');

    return Buffer.from(str, 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};

const sendEmail = async (to: string[], from: string, subject: string, message: string): Promise<void> =>
    new Promise(async (resolve, reject) => {
        const gmail = await init();
        var raw = createEmail(to.join(','), from, subject, message);
        gmail.users.messages.send(
            {
                userId: 'me',
                requestBody: {raw},
            },
            err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });

export default sendEmail;
