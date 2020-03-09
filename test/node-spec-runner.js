#!/usr/bin/env node --experimental-modules --no-warnings

/* eslint-env node */

import './dom-emulation.js';

import chai                 from 'chai';
import glob                 from 'glob';
import Mocha                from 'mocha';
import { dirname }          from 'path';
import { fileURLToPath }    from 'url';
import { promisify }        from 'util';

function testExecArgv(regExp)
{
    const returnValue = process.execArgv.some(arg => regExp.test(arg));
    return returnValue;
}

(async () =>
{
    global.chai = chai;
    const mocha = new Mocha({ checkLeaks: true });
    const currentUrl = import.meta.url;
    const __dirname = dirname(fileURLToPath(currentUrl));
    const files = await promisify(glob)('*.spec.js', { cwd: __dirname, nodir: true });
    mocha.suite.emit('pre-require', global, null, mocha);
    {
        const debug = testExecArgv(/^--inspect-brk(?![^=])/);
        mocha.enableTimeouts(!debug);
    }
    const urls = files.map(file => new URL(file, currentUrl));
    for (const url of urls)
        await import(url); // eslint-disable-line no-await-in-loop
    mocha.run
    (
        failures =>
        {
            if (failures)
                process.exitCode = 1;
        },
    );
}
)();
