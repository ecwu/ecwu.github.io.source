---
title: Cleaning Up Git Repo For My Blog
subtitle: 
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/842ofHC6MaI/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8M3x8Z2l0fHwwfHx8fDE2NDE5MDkxMTI&force=true&w=2400
unsplashfeatureimage: Yancy Min

publishDate: "2022-01-10T15:54:37+08:00"
lastmod: 
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: true
math: false
gallery: true
showinfocard: true
enablecomment: true

series: Website Note
previous:
next:

confidence: likely
importance: 7

tags:
- github
- git
- repository
- git branch
- git rebase

categories:
- Website

# type: file, link, image, and others
extramaterials:
- type: link
  name: "SO: How does origin/HEAD get set?"
  url: "https://stackoverflow.com/questions/8839958/how-does-origin-head-get-set"
- type: link
  name: "SO: What are the differences between git remote prune, git prune, git fetch --prune, etc"
  url: "https://stackoverflow.com/questions/20106712/what-are-the-differences-between-git-remote-prune-git-prune-git-fetch-prune"
- type: link
  name: "SO: What is a \"stale\" git branch?"
  url: "https://stackoverflow.com/questions/29112156/what-is-a-stale-git-branch"

copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## What I have done

When creating the theme announced in the post [Switching to a new theme ... I guess]({{< relref "/post/new-theme-for-blog.md" >}}). I set up a new branch in the original [source repository](https://github.com/ecwu/ecwu.github.io.source) and uses Cloudflare pages to build the previews for the site. This can make sure all the original Github actions for the main site working normally.

Since the new branch `new-theme` was created using attribute `--orphan`, it will be impossible to do pull requests to the original default branch `master`. So I did a workaround.

1. Change branch name from `new-theme` to `main` locally
2. Push the new branch to the remote
3. Change the default to `main` via GitHub Web UI
4. Rename `master` branch to `legacy` via GitHub Web UI
5. Remove `new-theme` branch via GitHub Web UI

(Noted that I probably did something wrong in step 2 with the following commands)

```bash
# Commands in Step 2
git fetch origin
git branch -u origin/main main
git remote set-head origin -a
git remote prune origin
git push -u
```

Everything seems to work after all these steps. And the site and GitHub actions are working perfectly.

## The problem surfaced

The theme is integrated into the repository using git submodule, but every time I do some changes to the theme, I have to commit twice: for both the theme and the blog source. I found [a bash script](https://gist.github.com/robballou/7dd8c1afd54e65ca44c8993c94a6517a) from GitHub Gist that can commit both the parent repo and the submodule changes.

I download the script, and it seems can be run without a problem and successfully push the changes in the submodule. But when the script is trying to push the parent repo, the script prompted a message, and the push action is not conducted.

```
Your configuration specifies to merge with the ref 'refs/heads/master'
from the remote, but no such ref was fetched.
```

I searched for the web and run command `git remote show origin`

```
warning: more than one branch.main.remote
* remote origin
  Fetch URL: git@github.com:ecwu/ecwu.github.io.source.git
  Push  URL: git@github.com:ecwu/ecwu.github.io.source.git
  HEAD branch: main
  Remote branches:
    legacy                        tracked
    main                          tracked
    refs/remotes/origin/master    stale (use 'git remote prune' to remove)
    refs/remotes/origin/new-theme stale (use 'git remote prune' to remove)
  Local branches configured for 'git pull':
    legacy merges with remote master
    main   merges with remote master
              and with remote new-theme
  Local ref configured for 'git push':
    HEAD pushes to main (up to date)
```

The messages show that there are more than one `branch.main.remote`, and two local branches `legacy` and `main` are set to merge with `master` and `new-theme` branches which are no longer exist.

So I believe the solution is to re-config the default merge branch for the local branches and remove the stale remote branches.

## Re-config the branch

The file that stores the configuration is located in `.git/config`, after opening the file, I can spot that there are two `[branch "main"]`, and its merge field is filled incorrectly. I remove one extra one and change the field to `ref/heads/main`.

```toml
# Final result in .git/config
[branch "main"]
    remote = origin
    merge = refs/heads/main
[branch "legacy"]
    remote = origin
    merge = refs/heads/main
```

Then, I run the command `git fetch origin --prune`, it removes those outdated branches.

```
$ git fetch origin --prune
From github.com:ecwu/ecwu.github.io.source
 - [deleted]         (none)     -> origin/master
   (refs/remotes/origin/HEAD has become dangling)
 - [deleted]         (none)     -> origin/new-theme
```

Now, my remote seems normal, and rebase pull is working fine!

```
* remote origin
  Fetch URL: git@github.com:ecwu/ecwu.github.io.source.git
  Push  URL: git@github.com:ecwu/ecwu.github.io.source.git
  HEAD branch: main
  Remote branches:
    legacy tracked
    main   tracked
  Local branches configured for 'git pull':
    legacy merges with remote main
    main   merges with remote main
  Local ref configured for 'git push':
    HEAD pushes to main (up to date)
```

## Extra words
When I encounter the problem, I was also confused by the multiply remote branches (`refs/remotes/origin/master`, `refs/heads/master`, ...) that were seen to point to the same branch. If this also confuse you, you can check the post [What are the differences between git remote prune, git prune, git fetch --prune, etc](https://stackoverflow.com/questions/20106712/what-are-the-differences-between-git-remote-prune-git-prune-git-fetch-prune) on StackOverflow.