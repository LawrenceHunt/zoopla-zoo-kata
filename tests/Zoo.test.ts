import { formatDistanceToNow } from 'date-fns';
import { Zoo, User, CLI } from '../src/Zoo';

describe('User', () => {
    it('can be created with a name', () => {
        const testName = 'Alice';
        const testUser = new User(testName);
        expect(testUser.name).toBe(testName);
    });

    it('can publish a post to a timeline', () => {
        const testUser = new User('Alice');
        const testPostText = 'I love the weather today';
        const testPost = testUser.addPost(testPostText);
        expect(testUser.posts).toEqual(expect.arrayContaining([testPost]));
    });
});

describe('Zoo', () => {
    it('can add a user', () => {
        const testUser = new User('Alice');
        const testZoo = new Zoo();
        testZoo.addUser(testUser);
        expect(testZoo.users).toEqual(expect.arrayContaining([testUser]));
    });
});

describe('CLI', () => {
    let testZoo: Zoo, testCLI: CLI;

    beforeEach(() => {
        testZoo = new Zoo();
        testCLI = new CLI(testZoo);
    });

    it('can create a user', () => {
        const output = testCLI.input('add Alice');
        expect(output).toBe(`user Alice created`);
        expect(testZoo.users).toEqual(
            expect.arrayContaining([new User('Alice')])
        );
    });

    it("can view a user's timeline", () => {
        const testName = 'Alice';
        const testUser = new User(testName);
        const testPostText = 'I love the weather today';
        testZoo.addUser(testUser);
        testUser.addPost(testPostText);
        const output = testCLI.input('Alice wall');
        expect(output).toEqual(
            'Alice: I love the weather today (less than a minute ago)'
        );
    });

    it('can follow a user', () => {
        const testUser1 = new User('Alice');
        const testPostTextUser1 = 'I love the weather today';
        const testUser2 = new User('Bob');
        const testPostTextUser2 =
            "I'm in New York today! Anyone want to have a coffee?";
        testZoo.addUser(testUser1);
        testZoo.addUser(testUser2);
        testUser1.addPost(testPostTextUser1);
        testUser2.addPost(testPostTextUser2);
        const output = testCLI.input('Bob follows Alice');
        expect(output).toBe('Bob has started following Alice');
    });

    it.only('will read out the timeline in chronological order for a user who follows another user', () => {
        const testUser1 = new User('Alice');
        const testPostTextUser1 = 'I love the weather today';
        const testUser2 = new User('Bob');
        const testPostTextUser2 =
            "I'm in New York today! Anyone want to have a coffee?";
        testZoo.addUser(testUser1);
        testZoo.addUser(testUser2);
        const testPostUser1 = testUser1.addPost(testPostTextUser1);
        const testPostUser2 = testUser2.addPost(testPostTextUser2);
        testZoo.addUserFollow('Bob', 'Alice');

        const output = testCLI.input('Bob wall');

        expect(output).toEqual(
            [
                `Bob: I'm in New York today! Anyone want to have a coffee? (${formatDistanceToNow(
                    new Date(testPostUser2.dateStamp)
                )} ago)`,
                `Alice (1 like): I love the weather today (${formatDistanceToNow(
                    new Date(testPostUser1.dateStamp)
                )} ago)`,
            ].join('\n')
        );
    });

    it('can un-follow a user', () => {
        const testUser1 = new User('Alice');
        const testPostTextUser1 = 'I love the weather today';
        const testUser2 = new User('Bob');
        const testPostTextUser2 =
            "I'm in New York today! Anyone want to have a coffee?";
        testZoo.addUser(testUser1);
        testZoo.addUser(testUser2);
        const testPostUser1 = testUser1.addPost(testPostTextUser1);
        const testPostUser2 = testUser2.addPost(testPostTextUser2);
        testZoo.addUserFollow('Bob', 'Alice');
        const output1 = testCLI.input('Bob unfollows Alice');
        expect(output1).toBe('Bob has stopped following Alice');

        const output2 = testCLI.input('Bob wall');
        expect(output2).not.toEqual(
            [
                `Bob: I'm in New York today! Anyone want to have a coffee? (${formatDistanceToNow(
                    new Date(testPostUser2.dateStamp)
                )} ago)`,
                `Alice (1 like): I love the weather today (${formatDistanceToNow(
                    new Date(testPostUser1.dateStamp)
                )} ago)`,
            ].join('\n')
        );
        expect(output2).toEqual(
            `Bob: I'm in New York today! Anyone want to have a coffee? (${formatDistanceToNow(
                new Date(testPostUser2.dateStamp)
            )} ago)`
        );
    });
});
