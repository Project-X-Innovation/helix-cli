# Ticket Context

- ticket_id: cmq13q07a006f7s0uwbo3gkt9
- short_id: RSH-694
- run_id: cmq13q07r006k7s0uo3fdh6ab
- run_branch: helix/research/RSH-694-upgrades-to-needs-credentials
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Upgrades to Needs Credentials

## Description
I have a couple of problems with needing credentials on Helix Global. Again I'm not talking about Helix NetSuite at this point. I'm talking about just Helix Global.



There are a couple of things:

1. Very often Helix says it needs credentials for something that it does not. In particular when it comes to recognizing that this is a dev environment, the database that is handed to Helix in general is a clone of the staging database that is given using Neon. Whenever Helix is given a Neon database, he should know that it is a totally fresh database for him to do whatever he needs to do: change credentials, get credentials, augment accounts. Whatever, that's the point of having the Neon database, that he can do anything he wants.

2. Sometimes I see he gets stuck on ENV configurations. He is running a dev environment. The ENV is just a file and he should be able to change and augment and play with anything in the dev environment. He should know very clearly that he has a dev database that is provisioned by a service when it is in fact. You should know that he's in the dev environment and can do whatever he needs to do, right? Anything that is given to Helix in the dev environment is fair game. Those are the rules. He can change anything he likes. He can be as clever as he likes. Unless it is explicitly stated that something is production, it should be assumed that if he has access to it, it is dev and he can do whatever he wants. 



Again I'm saying this for Helix Global. For Helix NetSuite there are already different concepts of verification going on with the NetSuite team. I don't want to get involved in that currently. 



Go look at the last dozen or so times that Helix came back and said "needs verification" and do an honest assessment, maybe a couple dozen times. An honest assessment of whether Helix should have been able to verify, knowing that this is a dev environment, or whether there was an actual problem. Do an analysis on that and suggest fixes.

## Attachments
- (none)
