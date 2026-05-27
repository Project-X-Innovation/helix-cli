# Ticket Context

- ticket_id: cmpncrrov00033y0tfhg9tf36
- short_id: RSH-611
- run_id: cmpngslft002c7j0u0rgldoqk
- run_branch: helix/research/RSH-611-helix-evals-regression
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Helix Evals Regression

## Description
I want a basic e2e crossed with evals regression suite



If you inspect you will see we have some 15 or so evals in the evals org (I'll add documentation too)



The idea is that the suite would use something like playwright to manually enter each ticket eval, assure it is "successful" (whatever that means) and function as a basic suite for regression of the whole app. I'm not currently concerned where this will run long term, for now you can assume it will be run by running npm run test in the regression suite, after already running the dev server and client



The priority is not to evaluate the quality of the agent, but to function as at least a regression test.



The fact is we release deployments several times a day and the velocity is too high to manage manually.



So do some research and think about how to accomplish this. Feel free to make your own suggestions. This is my suggestion: use the evals within an end-to-end test where you put in this content in the ticket and you wait till it finishes. How you wait is something for you to figure out as well because it can be an hour or two. I don't mind if evals run over 24 hours. That's okay for now. That's fine. 



Feel free to brainstorm better ways to do what I'm doing but this is one way. 



This idea is not quite eval. It's kind of using the eval's end-to-end test, regression test form to get the best of both worlds. 

Feel free, after brainstorming, to include a basic plan to get something up because even a minimal plan here helps us a lot. It keeps us at least from pushing things that are disasters and then feel free to stack on top improvements. 

And yes, I know many are failing, that's good, they will pass as we improve.



&nbsp;

&nbsp;

## Attachments
- Untitled document.pdf (application/pdf, 323302 bytes)

## Discussion
- **Helix** (2026-05-27T01:36:06.662Z) [Agent]: Your research report is ready!
- **Helix** (2026-05-27T01:46:09.921Z) [Agent]: Your research report is ready!

## Continuation Context
Go ahead and do another iteration taking into account these two major ideas:

1. It is first and foremost a regression test and should be done through the UI.

2. Including verifying the N result. This should be done with playwright. Keep in mind, this is a playwright test.



&nbsp;

How to do that? I'll leave that up to you to figure out how to do them. You can go into detail. How do we actually do this with playwright? Assuming it's not an agent doing this the whole time or in what role does the agent play?



Second of all only a not-any-terminal state is a pass. Only the passing states are a pass. Failed states are a fail. The ones that are in that state now will fail.
