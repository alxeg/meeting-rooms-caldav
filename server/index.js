import express from 'express';

import Scrapegoat from 'scrapegoat';
import moment from 'moment';
import {uniqWith, isEqual} from 'lodash';

const app = express();
const config = require('./config');
const port = config.port?config.port:3000;

app.get('/api/rooms',  (req, res) => {
    res.send(config.getRooms());
});

app.get('/api/calendar/:roomId', (req, res) => {
    let roomId = req.params.roomId;
    const start = moment(req.query.start).format("YYYYMMDD[T]HHmmss[Z]");
    const end = moment(req.query.end).format("YYYYMMDD[T]HHmmss[Z]");

    config.getRoom(roomId).caldav.getEventsByTime(start, end).then(events => {
        let result = events.map(event => {
            return {
                title: config.showTitle? event.data.title : event.data.organizer,
                subject: event.data.organizer,
                start: moment(event.data.start).format(),
                end: moment(event.data.end).format()
            };
        });
        result = uniqWith(result, isEqual);
        res.send(result);
    });
});


app.use('/', express.static('dist'));

app.listen(port, () => {
    console.log('Example app listening on port 3000!');
});