import fs from 'fs';
import readline from 'readline';
import {google, gmail_v1} from 'googleapis';
import {OAuth2Client} from 'googleapis-common';

export type GmailMessageHandler = (message: gmail_v1.Schema$Message) => Promise<boolean>;

const CREDENTIALS = './data/googleAuthKey.json';
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS).toString('utf8'));
let gmail: gmail_v1.Gmail;

export const init = async (): Promise<gmail_v1.Gmail> =>
    new Promise(async resolve => {
        const oAuth2Client = await authorize(credentials);
        gmail = google.gmail({version: 'v1', auth: oAuth2Client});
        resolve(gmail);
    });

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = './data/googleAuthToken.json';

const authorize = async (credentials: {
    installed: {
        client_secret: string;
        client_id: string;
        redirect_uris: Array<string>;
    };
}): Promise<OAuth2Client> =>
    new Promise(resolve => {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                return void resolve(getNewToken(oAuth2Client));
            }
            oAuth2Client.setCredentials(JSON.parse(token.toString()));
            resolve(oAuth2Client);
        });
    });

const getNewToken = async (oAuth2Client: OAuth2Client): Promise<OAuth2Client> =>
    new Promise((resolve, reject) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', code => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                console.log(token);
                if (err || !token) {
                    return void reject(err);
                }
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
                    if (err) {
                        return void reject(err);
                    }
                    console.log('Token stored to', TOKEN_PATH);
                });
                resolve(oAuth2Client);
            });
        });
    });
