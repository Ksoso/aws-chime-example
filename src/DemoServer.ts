/**
 * Express Server file.
 *
 * created by Sean Maxwell Jan 21, 2019
 */

import * as path from 'path';
import * as express from 'express';
import * as controllers from './controllers';
import {Server as NodeHttp} from 'http';

import {Server} from '@overnightjs/core';
import {Logger} from '@overnightjs/logger';
import {Socket} from 'socket.io';
import {v4 as uuidV4} from 'uuid';

class DemoServer extends Server {

    private readonly SERVER_START_MSG = 'Demo server started on port: ';
    private readonly DEV_MSG = 'Express Server is running in development mode. No front-end ' +
        'content is being served.';

    private server?: NodeHttp;
    private usersMap: {
        [key: string]: {
            userName: string,
            uuid: string
        }
    } = {};

    constructor() {
        super(true);
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.setupControllers();
        // Point to front-end code
        if (process.env.NODE_ENV !== 'production') {
            this.app.get('*', (req, res) => res.send(this.DEV_MSG));
        } else {
            this.serveFrontEndProd();
        }
    }

    private setupControllers(): void {
        const ctlrInstances = [];
        for (const name in controllers) {
            if (controllers.hasOwnProperty(name)) {
                let Controller = (controllers as any)[name];
                ctlrInstances.push(new Controller());
            }
        }
        super.addControllers(ctlrInstances);
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
        Logger.Info('initializing socket');
        const io = require('socket.io')(this.server);
        io.on('connect', (socket: Socket) => {
            Logger.Info('user connected');

            socket.on('userJoin', (data: any) => {
                if (this.usersMap[socket.id]) {
                    this.usersMap[socket.id].userName = data.userName;
                } else {
                    this.usersMap[socket.id] = {
                        userName: data.userName,
                        uuid: uuidV4(),
                    }
                }
                io.emit('userList', this.usersMap, socket.id);
            });

            socket.on('callToUser', (data: any) => {
                socket.broadcast.to(data.recipient).emit('callIncoming', {
                    meetingId: data.meetingId, recipient: data.sender
                })
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
            Logger.Imp(this.SERVER_START_MSG + port);
        });
        this.initSocket();
    }
}

export default DemoServer;
