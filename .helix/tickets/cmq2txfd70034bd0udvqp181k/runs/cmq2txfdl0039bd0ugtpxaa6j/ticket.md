# Ticket Context

- ticket_id: cmq2txfd70034bd0udvqp181k
- short_id: RSH-727
- run_id: cmq2txfdl0039bd0ugtpxaa6j
- run_branch: helix/research/RSH-727-playbook-basic-flow
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Playbook Basic Flow

## Description
There are a few challenges currently. 



Here's my experience:

1. I was in the PXNS Eval's account.

2. I created a rule.

3. The rule got saved.

4. I went in, I hit check. It started checking.

5. I navigated out and I came back and it's like it never happened.



So first of all all the checking should happen behind the scenes asynchronously. It takes several minutes. I don't want to have to wait there and I want it to be saved and ready for me when I come back. 



Second of all when it is created or edited the whole system should just automatically fire at you. It should right away go check. It should right away look up the examples. It should right away go give me the stats and see if this is real.



Why do we need to break this up into several painstaking steps? Put in the rule, right away fire it. If I hit recheck it can go and recheck but checking is always asynchronous and is safe for me to come see later



So take a step back. I think maybe we ran into this very quickly. Take a step back, see what the infrastructure looks like. See how we want this to be done. I think you understand the end result, right? The end result is you put in a rule. There's no such thing as a rule without verifying, without checking. It may take a few minutes but as soon as you put in a rule, it should right away start checking and save those checks

And there should be no such thing as checking in real time. It should always be asynchronous.

## Attachments
- (none)
