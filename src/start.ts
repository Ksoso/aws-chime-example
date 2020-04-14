/**
 * Start the server for development or production or run tests.
 *
 */
import Server from './Server';

// Start the server or run tests
if (process.env.NODE_ENV !== 'testing') {

    const server = new Server();
    server.start(process.env.NODE_ENV === 'development' ? 3001 : 8081);

} else {

    // tslint:disable-next-line:variable-name no-var-requires
    const Jasmine = require('jasmine');
    const jasmine = new Jasmine();

    jasmine.loadConfig({
        spec_dir: 'src',
        spec_files: [
            './controllers/**/*.test.ts',
        ],
        stopSpecOnExpectationFailure: false,
        random: true,
    });

    jasmine.onComplete((passed: boolean) => {
        if (passed) {
            console.info('All tests have passed :)');
        } else {
            console.error('At least one test has failed :(');
        }
    });

    let testPath = process.argv[3];

    if (testPath) {
        testPath = `./src/${testPath}.test.ts`;
        jasmine.execute([testPath]);
    } else {
        jasmine.execute();
    }
}
