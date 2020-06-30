const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
	try {
		core.debug("run: enter")
		const token = core.getInput('repo-token', { required: true });
		const octokit = github.getOctokit(token);
		const context = github.context;
		const payload = context.payload;
		const is_issue = !!payload.issue;
		if (!is_issue && !payload.pull_request) {
			core.debug('The event that triggered this action was not a pull request or issue, skipping.');
			return;
		}
		if (payload.action !== 'opened') {
			core.debug('No issue or PR was opened, skipping');
			return;
		}
		if (!payload.sender) {
			throw new Error('Internal error, no sender provided by GitHub');
		}
		const issue = context.issue;
		if (is_issue) {
			core.debug(`Closing issue: ${issue.number}`);
			await octokit.issues.update({
				owner: issue.owner,
				repo: issue.repo,
				issue_number: issue.number,
				state: 'closed'
			});
			core.debug(`Closed issue: ${issue.number}`);
			core.debug(`Locking issue: ${issue.number}`);
			await octokit.issues.lock({
				owner: issue.owner,
				repo: issue.repo,
				issue_number: issue.number
			});
			core.debug(`Locked issue: ${issue.number}`);
		}
		else {
			core.debug(`Closing PR: ${issue.number}`);
			await octokit.pulls.update({
				owner: issue.owner,
				repo: issue.repo,
				pull_number: issue.number,
				state: 'closed'
			});
			core.debug(`Closed PR: ${issue.number}`);
			core.debug(`Locking PR: ${issue.number}`);
			await octokit.issues.lock({
				owner: issue.owner,
				repo: issue.repo,
				issue_number: issue.number
			});
			core.debug(`Locked PR: ${issue.number}`);
		}
		core.debug('run: exit')
	}
	catch (error) {
		core.setFailed(error.message);
	}
}

run();