# Geomon

What is Geomon project?
* Geomon project is a lightweight and simple monitoring system.

What you can do with Geomon?
* View your current location on the map
* Save your history of movement

Basic features
* HTML5 geolocation
* Version optimized for mobile devices saves traffic and battery charge
* Sensitive design

<a href="https://github.com/rubanbs/geomon/blob/master/public/img/screenshot-1.png" style="display:inline-block;"><img src="https://github.com/rubanbs/geomon/blob/master/public/img/screenshot-1-sm.png" align="left" height="198" width="360" ></a>
<a href="https://github.com/rubanbs/geomon/blob/master/public/img/screenshot-2.png" style="display:inline-block;"><img src="https://github.com/rubanbs/geomon/blob/master/public/img/screenshot-2-sm.png" align="left" height="198" width="360" ></a>


## Dev Stack

* Backend: [Node.js](http://nodejs.org/) with [Express.js](http://expressjs.com/)
* Frontend: [jQuery](http://jquery.com/), [Angular.js](https://angularjs.org/)
* CSS based on [Twitter Bootstrap](http://getbootstrap.com/)
* [OpenStreetMap (OSM)](https://www.openstreetmap.org) with [Openlayers](http://openlayers.org/)
* Data store: [MongoDB](http://www.mongodb.org/)

## Get the Code

You can just clone the repository

```
git clone https://github.com/rubanbs/geomon.git
cd geomon
```

and then install dependencies.

```
npm install
```

## Configuring database

Specify connection info to your mongodb instance in `config/database.js` in `url` param:
```
url : 'mongodb://<user>:<pass>@server:port/<yourdbname>'
```

## Starting app

```
npm start
```

Command starts application (on port 3000 by default). Now you can access it in your browser at `http://localhost:3000/`

## Unit test

App used [Karma test runner](http://karma-runner.github.io/0.12/index.html) and tests written using [Jasmine](http://jasmine.github.io/) syntax.

* First. Install karma-cli and grunt as global packages
```
npm install -g karma-cli grunt
```
* Then navigate to `test` folder and run tests
```
cd test
karma start karma.conf.js
```