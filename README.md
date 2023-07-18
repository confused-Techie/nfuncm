# NfuncM

> Node Function Manager

Have you ever thought there needed to be a middle ground between a snippet of code on Stack Overflow and a full blown NPM Module?

Have you ever saw an NPM module and thought to yourself "This really shouldn't be a module. It's just a couple lines of code.".

Personally, I've thought this myself many, many times, but came to the conclusion, that just because a snippet of code is short, and could easily be implemented yourself, there are times you want to continually get updates.

---

## Use Case

A perfect example of where `NfuncM` shines is complex Regex.

Say you need Regex in order to check the validity of an email address.

Searching online, there is a fantastic writeup of why this regex works the way it does, and why it's valid. The regex is as follows:

```
(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])
```

This is long, and complicated, and really only someone well versed in exactly how this works could ever update it.

But this is easy enough to copy and paste and put into your code.

But what if in this scenario, six months later the original author realizes there was a mistake and helpfully fixes it. Thing is, your code never gets that fix. And you likely would never know something has gone wrong.

Using the "Node Function Manager" this regex can be exported as just that, regex, that can be continually updated, and easy for you to use, costing minimal network traffic, and more importantly minimal storage space.

## What this Solves

* As you can see above, important updates are still able to be received.
* Authors for small snippets of code get to have their license respected, where many users don't realize that StackOverflow enforces a license at all.
* Huge savings on disk space by not having to install a full module of half a dozen files for one simple needed function.
* The simplicity of the interface removes the possibility of dependency hell.


## Bonuses of NFM

* NFM has **zero** dependencies!
* NFM is only 12.9 kB unpacked!
* NFM is unobtrusive, installed functions are small enough they can be included in your git repo, or docker image to avoid installation later
