import fs from 'fs';
import path from 'path';
import Scrapegoat from 'scrapegoat';

const configPath = path.resolve(__dirname, '../', "server-config.json");
const configData = JSON.parse(fs.readFileSync(configPath));

const config = {
    showTitle: configData.showTitle,
    port: configData.port,

    getRooms : () => {
        return Object.keys(configData.rooms).map(key => {
            return {
              id: key,
              name: configData.rooms[key].name,
              description: configData.rooms[key].description
            };
        });
    },

    getRoom : (id) => {
        let room = configData.rooms[id];
        if (room && !room.hasOwnProperty('caldav')) {
            let scapegoat = new Scrapegoat({
                auth: {
                    user: room.login,
                    pass: room.password
                },
                uri: configData.baseUrl + room.login + "/" + room.calendarId,
                timeout: configData.timeout ? configData.timeout : 10000
            });
            room.caldav = scapegoat;
        }
        return room;
    }
}

module.exports = config;

