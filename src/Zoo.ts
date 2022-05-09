import { formatDistanceToNow, sub } from 'date-fns';

export class Post {
    text: string;
    author: string;
    dateStamp: string;

    constructor(text: string, author: string) {
        this.text = text;
        this.author = author;
        this.dateStamp = new Date().toISOString();
    }
}

export class User {
    name: string;
    follows: Array<string> = [];
    isFollowedBy: Array<string> = [];
    posts: Array<Post> = [];

    constructor(name: string) {
        this.name = name;
    }

    addFollow(objectUserName: string) {
        if (this.follows.includes(objectUserName)) {
            throw new Error(
                `User ${this.name} already follows user ${objectUserName}`
            );
        }
        this.follows.push(objectUserName);
    }

    addIsFollowedBy(subjectUserName: string) {
        if (this.isFollowedBy.includes(subjectUserName)) {
            throw new Error(
                `User ${subjectUserName} already follows user ${this.name}`
            );
        }
        this.isFollowedBy.push(subjectUserName);
    }

    removeFollow(objectUserName: string) {
        if (!this.follows.includes(objectUserName)) {
            throw new Error(
                `User ${this.name} does not follow user ${objectUserName}`
            );
        }
        this.follows = this.follows.filter(
            (userName) => userName !== objectUserName
        );
    }

    removeisFollowedBy(subjectUserName: string) {
        if (!this.isFollowedBy.includes(subjectUserName)) {
            throw new Error(
                `User ${subjectUserName} does not follow ${this.name}`
            );
        }
        this.isFollowedBy = this.isFollowedBy.filter(
            (userName) => userName !== subjectUserName
        );
    }

    addPost(text: string) {
        const post = new Post(text, this.name);
        this.posts.push(post);

        return post;
    }
}

export class Zoo {
    users: Array<User> = [];

    addUser(newUser: User) {
        if (this.users.find((user) => user.name === newUser.name)) {
            throw new Error('User name must be unique to this Zoo');
        }
        this.users.push(newUser);
        return true;
    }

    getUserByName(name: string) {
        return this.users.find((user) => user.name === name) || null;
    }

    getPostsFor(userName: string) {
        const user = this.getUserByName(userName);

        const followedPosts = user.follows.reduce(
            (all: Array<Post>, userName: string) => {
                return [...all, ...this.getUserByName(userName).posts];
            },
            []
        );

        return [...user.posts, ...followedPosts]
            .sort((a, b) => +new Date(a.dateStamp) - +new Date(b.dateStamp))
            .map((post) => {
                const postAuthor = this.getUserByName(post.author);
                const postAuthorIsFollowedByCount =
                    postAuthor.isFollowedBy.length;

                console.log(
                    'author',
                    postAuthor.name,
                    postAuthorIsFollowedByCount
                );
                const postAuthorLikesText = postAuthorIsFollowedByCount
                    ? ` (${postAuthorIsFollowedByCount} like${
                          postAuthorIsFollowedByCount === 1 ? '' : 's'
                      })`
                    : '';
                return `${postAuthor.name}${postAuthorLikesText}: ${
                    post.text
                } (${formatDistanceToNow(new Date(post.dateStamp))} ago)`;
            })
            .join('\n');
    }

    addUserFollow(subject: string, object: string) {
        const subjectUser = this.getUserByName(subject);
        const objectUser = this.getUserByName(object);

        if (subjectUser && objectUser) {
            subjectUser.addFollow(objectUser.name);
            objectUser.addIsFollowedBy(subjectUser.name);
        }

        return true;
    }

    removeUserFollow(subject: string, object: string) {
        const subjectUser = this.getUserByName(subject);
        const objectUser = this.getUserByName(object);

        if (subjectUser && objectUser) {
            subjectUser.removeFollow(objectUser.name);
            objectUser.removeisFollowedBy(subjectUser.name);
        }

        return true;
    }
}

export class CLI {
    zoo: Zoo;

    constructor(zoo: Zoo) {
        this.zoo = zoo;
    }

    public input(input: string) {
        return this.parseInput(input);
    }

    private parseInput(input: string) {
        const addNameReg = new RegExp(/add\s([A-Z]\w+)/);
        const nameMatch = input.match(addNameReg);

        if (nameMatch) {
            const name = nameMatch[1];
            const newUser = new User(name);
            this.zoo.addUser(newUser);
            return `user ${name} created`;
        }

        const followReg = new RegExp(/([A-Z]\w+)\sfollows\s([A-Z]\w+)/);
        const followRegMatch = input.match(followReg);
        if (followRegMatch) {
            const subject = followRegMatch[1];
            const object = followRegMatch[2];
            const success = this.zoo.addUserFollow(subject, object);
            if (success) {
                return `${subject} has started following ${object}`;
            }
        }

        const unfollowReg = new RegExp(/([A-Z]\w+)\sunfollows\s([A-Z]\w+)/);
        const unfollowRegMatch = input.match(unfollowReg);
        if (unfollowRegMatch) {
            const subject = unfollowRegMatch[1];
            const object = unfollowRegMatch[2];
            const success = this.zoo.removeUserFollow(subject, object);
            if (success) {
                return `${subject} has stopped following ${object}`;
            }
        }

        const readWallReg = new RegExp(/([A-Z]\w+)\swall/);
        const readWallMatch = input.match(readWallReg);
        if (readWallReg) {
            const name = readWallMatch[1];
            return this.zoo.getPostsFor(name);
        }

        return null;
    }
}
