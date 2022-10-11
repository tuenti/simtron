import https from 'https';
import {getHermesCredentials} from '../config';
import Error, { HERMES_REQUEST_ERROR } from '../util/error';
import logger from '../util/logger';

const notifySmsReceived = async (msisdnFrom: string, msisdnTo: string, smsText: string) => {
  try {
    const data = JSON.stringify({
        "received_at": new Date().toISOString(),
        "text": smsText,
        "msisdn_from": msisdnFrom.length > 15 ? "none": msisdnFrom,
        "msisdn_to": msisdnTo
    })
    logger.debug(JSON.strinify(data));

    const options = {
      hostname: 'qacdco.d-consumer.com',
      port: 443,
      path: '/agora/simgrid/api/v1/inboundsms/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Basic ${getHermesCredentials()}`,
      },
    }
    logger.debug(JSON.strinify(options);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        logger.debug(data);
      });

      logger.debug(`Hermes request status code: ${res.statusCode}`);
    })

    req.write(data)
    req.end()
  } catch(e) {
    logger.error(Error(HERMES_REQUEST_ERROR, `${e}`));
  }
};

export default notifySmsReceived;
