const core = require('@actions/core');
const fs = require('fs');
const lineReader = require('line-by-line');

// golang - staticcheck
// https://staticcheck.io/
// https://staticcheck.io/docs/running-staticcheck/cli/formatters/#json
(function () {
    const file = core.getInput('staticcheck');
    if (!fs.existsSync(file)) {
        return
    }

    const lr = new lineReader(file);
    lr.on('line', function (line) {
        const currentLine = JSON.parse(line);

        core.error(currentLine.message, {
            file: currentLine.location.file,
            startLine: currentLine.location.line,
            startColumn: currentLine.location.column,
        });
    });
})();

(function () {
    let file = 'yaml-lint.txt'
    if (!fs.existsSync(file)) {
        return
    }
    const rgx = /(\w+):\s([^:]+):(\d+):(\d+): (.+)/gi;

    const lr = new lineReader(file);
    lr.on('line', function (line) {
        const matches = rgx.exec(line)
        if (!matches) {
            core.warning(`skip: ${line}.`)
            return
        }
        core.error(matches[5], {
            file: matches[2],
            startLine: matches[3],
            startColumn: matches[4],
        });
    });
})();

// eslint
// https://eslint.org/docs/latest/extend/custom-formatters#the-results-argument
(function () {
    const file = core.getInput('eslint');
    if (!fs.existsSync(file)) {
        return
    }
    const lines = JSON.parse(fs.readFileSync(file, 'utf8'));
    lines.forEach(function (line) {
        line.messages.forEach(function (message) {
            if (message.severity === 1) {
                core.warning(message.message, {
                    title: message.ruleId,
                    file: line.filePath,
                    startLine: message.line,
                    startColumn: message.column,
                });
            }
            if (message.severity === 2) {
                core.error(message.message, {
                    title: message.ruleId,
                    file: line.filePath,
                    startLine: message.line,
                    startColumn: message.column,
                });
            }
        });
    })
})();
