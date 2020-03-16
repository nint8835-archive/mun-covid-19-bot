import { Octokit } from '@octokit/rest';
import { createPatch, diffLines } from 'diff';
import { config as loadDotenv } from 'dotenv';
import moment from 'moment-timezone';
import fetch from 'node-fetch';
import { scheduleJob } from 'node-schedule';
import pretty from 'pretty';

loadDotenv();
const octokit = new Octokit({
    auth: process.env.GITHUB_PAT,
});

const INFORMATION_CENTRE_PATH = 'https://www.mun.ca/covid19/';

async function getBody(): Promise<string> {
    const content = await fetch(INFORMATION_CENTRE_PATH);
    return (
        pretty(
            (await content.text())
                .replace(/(\w*<meta name="\w{2}" content="[\d.]*" \/>)/g, '')
                .replace(/data-content=".*"/g, '')
                .replace(/\?\d*/g, ''),
        ) + '\n'
    );
}

let lastBody: string;

async function pollWebsite(): Promise<void> {
    const text = await getBody();
    const diff = diffLines(lastBody, text);
    const dateStamp = moment()
        .tz('America/St_Johns')
        .format('MMMM Do YYYY, h:mm:ss a');
    if (diff.length === 1) {
        console.log(dateStamp, 'No changes detected.');
        return;
    }
    const patch = createPatch('COVID-19.html', lastBody, text);
    const filenameDateStamp = moment()
        .tz('America/St_Johns')
        .format('MMMM_Do_YYYY_h_mm_ss_a');

    const filename = `COVID-19_${filenameDateStamp}.patch`;
    const gist = await octokit.gists.create({
        files: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            [filename]: {
                content: patch,
            },
        },
        description: `Changes as of ${dateStamp}`,
    });
    console.log(dateStamp, 'Changes detected. Diff:', gist.data.html_url);
    lastBody = text;
    if (typeof process.env.DISCORD_WEBHOOK !== 'string') {
        console.error('Invalid webhook provided.');
        process.exit(1);
    }
    fetch(process.env.DISCORD_WEBHOOK, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: `MUN's COVID-19 Information Centre (${INFORMATION_CENTRE_PATH}) has been updated.\n Diff: ${gist.data.html_url}`,
        }),
    });
}

async function run(): Promise<void> {
    lastBody = await getBody();
    scheduleJob('*/5 * * * *', pollWebsite);
}

run();
