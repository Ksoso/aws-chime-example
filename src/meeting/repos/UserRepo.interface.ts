import {User} from '../../shared/User.interface';

export interface UserRepo {

    saveUser(user: User): User;

    deleteUser(wsId: string): User | undefined;

    updateUser(wsId: string, toUpdate: { [key in keyof User]?: string }): User;

    exist(wsId: string): boolean;

    get(wsId: string): User | undefined;

    all(): { [key: string]: User }
}
