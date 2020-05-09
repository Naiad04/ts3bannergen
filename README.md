# ts3bannergen

ts3bannergen is a dynamic host banner generator for teamspeak3 servers.

This application has only 1 endpoint. ("/")
Depending on the type of HTTP request you either GET the banner or POST a new banner.
So to set up this generator to your server you need to configure your host banner URL to this endpoint (URL). For a simple example *localhost:3232*

The default port is 3232 but you can easily change using the PORT constant in index.js


### Setting a new image

By making a POST request to endpoint you can change the currently set image.
An example request would be like this.

    POST / HTTP/1.1
    Host: localhost
    Content-Type: application/json
    Content-Length: 52
    
    {"updateImage":"http://mywebsite.com/coolimage.png"}

I recently edited the code so the server only accepts requests coming from the local machine (for POST only).

Because this app meant to be used together with my other app [Naiad04/TeamCommand](https://github.com/Naiad04/TeamCommand).
If you delete this if clause from the index.js this wouldn't be the case but your application now can be edited by everyone so there is that. Maybe you may want to add authentication and create a pull request ;)

    if (req.connection.localAddress !== req.connection.remoteAddress) 

### Change timezone

Since this was a personal project looks like I didn't create a mechanism for properly configuring timezone.
For now, you can just change the number added to now.getUTCHours() or somehow customize the function createDigital in a way that works for you.

### Finally
There might be some problems with memory usage.
While I was using this application I observed some odd usage of memory. (eg 124 MB)
This doesn't happen immediately but after some hours/days of usage.
I tried to overcome this but none of my trials was the ultimate success.
For now, I am forcing a garbage collection after every get request. Even if it's a little bit odd this helps.

So I am using pm2 to both monitor memory usage and update my local app.
You can also use this with the ecosystem.config.js

I am using [Dalas/pm2-hook](https://github.com/Dalas/pm2-hook) module for auto-updating on any new commit.
