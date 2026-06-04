# Ticket Context

- ticket_id: cmpyt1iez008kak0uifhf9krr
- short_id: RSH-662
- run_id: cmpyt1ife008qak0ueir2d206
- run_branch: helix/research/RSH-662-audit-trail-brainstorm
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Audit Trail Brainstorm

## Description
All right this is a big one. Go fill up your coffee, put on your shoes, go for a walk, stare at the trees. This is going to be comprehensive. 



I'm thinking about an audit trail for both us as admins of all accounts internally, the Helix Team, as well as on an account-by-account level. Every single move should find a coherent theory of audit. We're an enterprise system. We need to see every single thing that happens:

- Every single thing the agent does

- Every single thing the user does

- Every single request

- Every network egress

- Everything that comes in



&nbsp;

Every single thing must be totally auditable if we want to be enterprise. Which we do.



Every time a ticket runs, every time a ticket fails, every time a ticket gets re-run, everything has to be totally auditable for them and for us to be honest. We need to be able to see everything as well.



Every time a sandbox gets fired up, every command into a sandbox, every command run by an agent and a shell in a sandbox, every tool used, everything. We have to think about what we want to let them see. We want to think about all the different types and how to present it. What is the right in an audit trail? You also tell a story. It's what's the story you want to tell? 



Let's focus on high-level concepts here. We can worry about implementation in a future ticket.

## Attachments
- (none)
