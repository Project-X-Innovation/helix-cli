# Ticket Context

- ticket_id: cmphicrz00032hu0u1g4uii9x
- short_id: RSH-579
- run_id: cmphicrzg0037hu0upod06eku
- run_branch: helix/research/RSH-579-ability-of-agents-of-helix-to-use-cli-to
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Ability of Agents of Helix to use CLI to accomplish various tasks

## Description
Before I go into detail, here are my questions:

- What can the agents do with the CLI?

- Technically they should be able to look at production logs and the production database using Inspect.

- Now they should also be able to look up any ticket, any report, not just the ticket that they're in.

- Using that CLI they should be able to create new tickets.

- They should be able to post comments all using the CLI.

 

I have also noticed some confusion with the agents, where they are not sure whether they should be using the CLI in the production environment or the staging environment.



Now in general Helix can work on all kinds of projects. Most of the time Helix does not have access to Helix source code and Helix staging. That's only in the case where Helix is building Helix. In that case Helix has access to both.



The CLI and the associated token are for production Helix. Everybody has access to production Helix in their account. In the case where they want to test staging Helix, they have to go into staging Helix and then create a token and then they can use the CLI for staging.



I just wanted to clarify that in general the token is for production Helix to be used in real life, checking up tickets, creating tickets, looking at the real-life production environment. 



#RSH-534 

See the end of this ticket where the report goes into detail about trying to create tickets with the CLI. It seems like perhaps the Agents only have a read-only version of the CLI besides the confusion with staging. 



So go ahead, play with the CLI, do some experiments. Again the main purpose of the CLI is with production. I'm going to give you access to the staging environment as well. If you want to play with the CLI in staging, you need to create your own token in staging.



The main question here is with production. Can you create tickets? Can you look up other tickets? If not you can analyze the code and figure out why. You can try fixing it in the staging environment and then get a token for staging by running it, navigating, or using the API and test your changes. First explore production and then explore staging with future changes.

## Referenced Tickets

1 ticket(s) referenced. Full artifacts materialized at `.helix-refs/`:

### RSH-534: Goals: The pm agent x Ralph Loop | Implementation plan
- Mode: RESEARCH | Status: REPORT_READY
- Completed runs: 5 (run-1, run-2, run-3, run-4, run-5)
- Materialized files: 150 artifacts
- Path: `.helix-refs/RSH-534/`
- Manifest: `.helix-refs/RSH-534/_manifest.json`

Read the manifest file for a complete file listing, or browse the directory directly.

## Attachments
- (none)
