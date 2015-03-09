# Mock-KingBird
Proxy and record Json API's. Playback recorded data offline. Mock or Stub new Api endpoints with test data.

**Mock-KingBird** is a first of its kind api mocking tool that supports a graphical UI.

With this tool you can create endpoints easily using only json and an idea of how the data should look. The tool can also proxy existing API calls and record the responses in order to create a baseline for you to work from and playback the recorded data while testing.

Mock-KingBird supports the following functionality at the time of writing:

- Multiple projects 
- Api proxy and record 
- Proxy playback of recorded data 
- New endpoint creation 
- JSON editor and Viewer – so that you never have to leave the app
- Json editor
- Ability to lock endpoints from being overwritten during recording, esp for manual changes
- Dual mode proxy and playback – Playback recorded data and proxy record new

Endpoint Url's are just that … Url's. With Mock-KingBird there is no worrying about how it executes or where the request is handled - requests are simply matched on the url structure, request method and request data. If a request signature match recorded data, the response is returned to the client.

Because Mock-KingBird is written using Node-Webkit it supports multiple desktop platforms.

![](https://github.com/TechnoDezi/Mock-KingBird/blob/master/Screenshots/Home.PNG?raw=true)