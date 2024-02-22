class PostmanTestSuite {
    constructor(yaml, apiId, postmanApiKey) {
        this.yaml = yaml;
        this.apiId = apiId;
        this.postmanApiKey = postmanApiKey;
    }

    runTests() {
        const req = {
            url: `https://api.getpostman.com/apis/${this.apiId}`,
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.postmanApiKey
            }
        };

        pm.sendRequest(req, (error, response) => {
            console.log(error ? error : response.json());
            let res = response.json();
            let reusable = res.api.versions[0].schemas[0].content;
            let parsedYml = jsyaml.load(reusable);

            this.executeScript(parsedYml.components['x-scripts'].HelloLogger.description);
            this.executeScript(parsedYml.components["x-tests"].StatusOkTest.description);
            this.executeScript(parsedYml.components["x-tests"].ContentTypeJsonTest.description);

            let notEmptyTest = parsedYml.components["x-tests"].NotEmptyTest.description.replace(/data/g, '"Symfony"');
            this.executeScript(notEmptyTest);

            let responseFormatTest = parsedYml.components["x-tests"].ErrorResponseFormatTest.description.replace(/body/g, '{"Symfony": 2.9}');
            this.executeScript(responseFormatTest);

            let customTest = parsedYml.components["x-tests"].CustomTest.description;
            let custTest = this.generateCustomTest(customTest, 'my new message', "pm.response.to.have.jsonBody('Symfony')");
            this.executeScript(custTest);
        });
    }

    executeScript(script) {
        eval(script);
    }

    generateCustomTest(customTest, message, testBody) {
        let customTestFunc = (message, testBody) => {
            let testString = customTest.replace(/message/g, message);
            return testString.replace(/testBody/g, testBody);

        };
        return customTestFunc(message, testBody);
    }
}

// Example of usage
const yaml = pm.globals.get('yaml-js');
(new Function(yaml))();
const apiId = pm.globals.get('apiId');
const postmanApiKey = pm.globals.get('postman-api-key');

const testSuite = new PostmanTestSuite(yaml, apiId, postmanApiKey);

testSuite.runTests();
