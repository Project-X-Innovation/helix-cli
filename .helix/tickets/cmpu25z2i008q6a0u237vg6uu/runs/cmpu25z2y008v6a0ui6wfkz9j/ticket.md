# Ticket Context

- ticket_id: cmpu25z2i008q6a0u237vg6uu
- short_id: RSH-633
- run_id: cmpu25z2y008v6a0ui6wfkz9j
- run_branch: helix/research/RSH-633-security-of-hot-sandboxes
- repo_key: helix-cli
- repo_url: https://github.com/Project-X-Innovation/helix-cli

## Title
Security of "hot" Sandboxes

## Description
I call a sandbox "hot" if it has access to the production DB. Inspect. For now let's focus only on Helix Net Suite. Production "fact" means production NSGM read-only access to the whole account so we'd only access one of them, about right. If the sandbox is open, it can query the entire account and then post to the Internet, which I would imagine is very damaging for business. This is the situation we are in today, I believe. 



What is the meta on this? How has the industry decided on what are some steps? Maybe there's no decision but what are some ways to go about solving this problem? I have some of my own ideas but first do a thorough analysis on what is out there. How have people attempted to solve this problem because a good agent needs full read access or something very close to it and they also need to interact with the world in general.



I have some ideas which I'll tell you soon. Inspect our situation, make sure you understand our situation, how our sandboxes work, and then understand that they have NetSuite prod access and access to the Internet. I understand that is a major security challenge and then do thorough research on how the world is solving this problem. I'll come back and give me some strategies and then I'll tell you what I had in mind and then we'll go from there. Keep it fairly high level, keep the tone on a strategic level. You don't have to talk to me like I'm five but talk to me like a CEO or CTO. 



Do a thorough analysis of how people are solving this and then come back. You can present the general strategies and then present the strategies that are relevant to our situation with Helix NetSuite. Keep in mind you are an expert teacher and you explain very clear, very complex topics clearly and simply so that I can understand them.

## Attachments
- (none)
