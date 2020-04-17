import {User} from '../../shared/User.interface';
import {UserRepo} from './UserRepo.interface';
import {v4 as uuidV4} from 'uuid';

interface UsersCache {
    [key: string]: User
}

export class UserRepoImpl implements UserRepo {

    private usersCache: UsersCache = {};

    deleteUser(wsId: string): User | undefined {
        const user = this.get(wsId);
        if (user) {
            delete this.usersCache[wsId];
        }
        return user;
    }

    saveUser(user: User): User {
        user.uuid = uuidV4();
        this.usersCache[user.wsId] = user;
        return user;
    }

    updateUser(wsId: string, toUpdate: { [key in keyof User]: string }): User {
        this.usersCache[wsId] = {...this.usersCache[wsId], ...toUpdate};
        return this.usersCache[wsId];
    }

    exist(wsId: string): boolean {
        return Boolean(this.usersCache[wsId]);
    }

    get(wsId: string): User | undefined {
        return this.usersCache[wsId];
    }

    all(): { [p: string]: User } {
        return this.usersCache;
    }

}
