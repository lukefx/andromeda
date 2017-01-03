const express = require('express');
const app = express();
const request = require('request');
const moment = require('moment');

app.get('/', function (req, res) {  
  const response = {
    code: 200,
    message: 'Andromeda ready to take off.'
  }
  res.json(response);
});

app.get('/loc', function(req, res) {

  request({
    url: 'http://transport.opendata.ch/v1/locations',
    qs: {
      query: req.query.q
    }
  }, function(error, response, body) {
    const api = JSON.parse(body);

    const locations = api.stations.map(s => {
      return {
        id: s.id,
        name: s.name
      }
    });

    res.json(locations);

  });

});

app.get('/lametric', function (req, res) {

  request({
    url: 'http://transport.opendata.ch/v1/connections',
    qs: {
      from: req.query.from || '008591073',
      to: req.query.to || '8587348',
      limit: 4,
      direct: 1
    }
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const api = JSON.parse(body);

      const connections = api.connections.map(c => {
        return {
          text: `${c.sections[0].journey.category}${c.sections[0].journey.number} ${moment(c.from.departure).fromNow()}`,
          icon: 'i3811'
        }
      });

      res.json({ 'frames': connections });

    }
  });

});

app.get('/time', function (req, res) {

  request({
    url: 'http://transport.opendata.ch/v1/stationboard',
    qs: {
      id: req.query.id,
      type: 'departure',
      limit: 4
    }
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const api = JSON.parse(body);

      const connections = api.stationboard.map(c => {
        return {
          service: c.subcategory,
          number: c.number,
          departure: c.stop.departure,
          in: moment(c.stop.departure).fromNow(),
          to: c.to
        }
      });

      res.json(connections);

    }
  });

});

app.get('/conn', function(req, res) {

  request({
    url: 'http://transport.opendata.ch/v1/connections',
    qs: {
      from: req.query.from || '008591073',
      to: req.query.to || '8587348',
      limit: 4,
      direct: 1
    }
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const api = JSON.parse(body);

      const connections = api.connections.map(c => {
        return {
          from: c.from.station.name,
          to: c.to.station.name,
          duration: c.duration,
          departure: c.from.departure,
          in: moment(c.from.departure).fromNow(),
          name: c.sections[0].journey.category,
          number: c.sections[0].journey.number
        }
      });

      res.json(connections);

    }
  });

});

const port = process.env.port || 3000;
app.listen(port, function () {
  console.log('Andromeda up and ready on port', port);
});
