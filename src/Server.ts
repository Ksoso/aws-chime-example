import * as path from 'path';
import * as express from 'express';
import {Server as NodeHttp} from 'http';
import * as cors from 'cors';
import * as compression from 'compression';
import {Socket} from 'socket.io';
import {meetingRouter} from './meeting';
import {demoRouter} from './demo';
import {UserSocketHandler} from './user/socket';
import {userRepo} from './user/repos';
import {usersRouter} from './user';

class Server {

    private readonly SERVER_START_MSG = 'AWS Chime server started on port: ';
    private readonly DEV_MSG = 'DEVELOPMENT MODE. No frontend content is being served.';

    private server?: NodeHttp;
    public app: express.Application;

    constructor() {
        this.app = express();

        //enabling CORS
        this.app.use(cors());
        //support for application/json type post dat
        this.app.use(express.json());
        //support for application/x-www-form-urlencoded post data
        this.app.use(express.urlencoded({extended: true}));
        //gzip compression
        this.app.use(compression());
        //adding routes
        this.app.use('/api/v1/meetings', meetingRouter);
        this.app.use('/api/v1/users', usersRouter);
        this.app.use('/api/v1/demo', demoRouter);

        // Point to front-end code
        if ('production' !== process.env.NODE_ENV) {
            this.app.get('*', (req, res) => res.send(this.DEV_MSG));
        } else {
            this.serveFrontEndProd();
        }
    }

    private serveFrontEndProd(): void {
        const dir = path.join(__dirname, 'public/react/demo-react/');
        // Set the static and views directory
        this.app.set('views', dir);
        this.app.use(express.static(dir));
        // Serve front-end content
        this.app.get('*', (req, res) => {
            res.sendFile('index.html', {root: dir});
        });
    }

    private initSocket(): void {
        const io = require('socket.io')(this.server);
        io.on('connect', (socket: Socket) => {
            new UserSocketHandler(userRepo, socket, io).init();
        });
    }

    public stop() {
        this.server?.close();
    }

    public start(port: number): void {
        this.server = this.app.listen(port, () => {
            console.log(`${this.SERVER_START_MSG}${port}`);
        });
        this.initSocket();
    }
}

export default Server;
