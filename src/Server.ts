/**
 * Express Server file.
 *
 */

import * as path from 'path';
import * as express from 'express';
import {Server as NodeHttp} from 'http';
import * as cors from 'cors';
import * as compression from 'compression';
import {Socket} from 'socket.io';
import {v4 as uuidV4} from 'uuid';
import {meetingRouter} from './meeting';
import {demoRouter} from './demo';

class Server {

    private readonly SERVER_START_MSG = 'AWS Chime server started on port: ';
    private readonly DEV_MSG = 'Express Server is running in development mode. No front-end ' +
        'content is being served.';

    private server?: NodeHttp;
    private usersMap: {
        [key: string]: {
            wsId: string,
            userName: string,
            uuid: string
        }
    } = {};

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
        console.info('initializing socket');
        const io = require('socket.io')(this.server);
        io.on('connect', (socket: Socket) => {
            console.info(`user connected: ${socket.id}`);

            socket.on('subscribe', (data: any) => {
                if (this.usersMap[socket.id]) {
                    this.usersMap[socket.id].userName = data.userName;
                } else {
                    this.usersMap[socket.id] = {
                        wsId: socket.id,
                        userName: data.userName,
                        uuid: uuidV4(),
                    };
                }
                io.emit('userList', this.usersMap, socket.id);
            });

            socket.on('callToUser', (data: any) => {
                socket.broadcast.to(data.recipientWsId).emit('callStatusChange', {
                    meetingId: data.meetingId, sender: data.sender, status: 'incoming'
                });
            });

            socket.on('acceptUserCall', (data: any) => {
                socket.broadcast.to(data.recipientWsId).emit('callStatusChange', {
                    meetingId: data.meetingId, sender: data.sender, status: 'in-progress'
                });
            });

            socket.on('declineUserCall', (data: any) => {
                socket.broadcast.to(data.recipientWsId).emit('callStatusChange', {
                    meetingId: data.meetingId, sender: data.sender, status: 'rejected'
                });
            });

            socket.on('disconnect', () => {
                delete this.usersMap[socket.id];
                io.emit('exit', this.usersMap);
            });

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
