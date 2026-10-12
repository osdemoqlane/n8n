// Creates the owner account that Qlane's tester signs in with (see
// compose.qlane.yaml). It runs once n8n is ready. An instance that already has
// an owner is left as it is, so the stack can restart.
const { N8N_URL, QA_OWNER_EMAIL, QA_OWNER_PASSWORD } = process.env;

const response = await fetch(`${N8N_URL}/rest/owner/setup`, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		email: QA_OWNER_EMAIL,
		firstName: 'QA',
		lastName: 'Owner',
		password: QA_OWNER_PASSWORD,
	}),
});

if (response.ok) {
	console.log(`Created the owner account ${QA_OWNER_EMAIL}.`);
} else {
	const body = await response.text();
	if (response.status === 400 && body.includes('already setup')) {
		console.log('The instance already has an owner. Nothing to do.');
	} else {
		console.error(`Owner setup failed with HTTP ${response.status}: ${body}`);
		process.exit(1);
	}
}
