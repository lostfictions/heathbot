## heathbot

tweets and toots Extremely Official Heathcliff Comics™.

https://twitter.com/its_heathcliff
https://mastodon.social/@heathcliff

![a mixed-up heathcliff comic](https://i.imgur.com/Sm4PpX6.png)

this is a twitter and mastodon bot written in
[typescript](https://www.typescriptlang.org/) and running on
[node.js](http://nodejs.org/).

you can run it on your computer or remix it into something new! you'll need node
and git installed. (you'll also need [yarn v1](https://classic.yarnpkg.com). if
you're on a recent version of node, just run [`corepack
enable`](https://nodejs.org/api/corepack.html) and you'll be good to go.)

then run:

```
git clone https://github.com/lostfictions/heathbot
cd heathbot
yarn install
```

to install the dependencies.

you'll also need some heathcliff comics to work with! you can find some on the
internet. same them to a folder named `persist/heathcliff` in the repo
directory. or place them anywhere els on your computer and set the `DATA_DIR`
environment variable when running the bot to tell it where to look.

when you're ready, run

```
yarn dev
```

to start generating some images locally. they'll be output to your system's temp
directory, and the bot will print the file locations as it goes.

in a server environment, this bot can be run with
[docker](https://docs.docker.com/) for an easier time. (i recommend
[dokku](http://dokku.viewdocs.io/dokku/) if you're looking for a nice way to
develop and host bots on your own server.)

the bot needs environment variables if you want it to do stuff:

- `MASTODON_TOKEN`: a Mastodon user API token
- `MASTODON_SERVER`: the instance to which API calls should be made (usually
  where the bot user lives.) (default: https://mastodon.social)
- `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, and
  `TWITTER_ACCESS_SECRET`: you need all of these guys to make a tweet.
- `DATA_DIR`: the directory to search for heathcliff comics. (default:
  'persist')

heathbot uses the [znv](https://github.com/lostfictions/znv/) library as well as
[dotenv](https://github.com/motdotla/dotenv), so you can alternately stick
any of the above environment variables in a file named `.env` in the project
root. (it's gitignored, so there's no risk of accidentally committing private
API tokens you put in there.)

![another mixed-up heathcliff comic](https://i.imgur.com/J061W3c.png)

###### [more bots?](https://github.com/lostfictions?tab=repositories&q=botally)
