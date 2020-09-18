import http from 'http';

const requestListener = (_: any, res: any) => {
    res.writeHead(200);
    res.end('Hello SRE team, thanks for making me see the light ;)');
};

const runApiServer = () => {
    const server = http.createServer(requestListener);
    server.listen(8080);
};

export default runApiServer;
