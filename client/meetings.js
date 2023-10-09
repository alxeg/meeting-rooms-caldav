import 'babel-polyfill';
import moment from 'moment';

import $ from 'jquery';

import Pikaday from 'pikaday/pikaday';

import 'jsrender';
import './jquery.timers.min';

import '@fullcalendar/core/main.css';
import '@fullcalendar/timegrid/main.css';

import ruLocale from '@fullcalendar/core/locales/ru';

import { Calendar } from '@fullcalendar/core';
import momentPlugin, { toMoment } from '@fullcalendar/moment';
import timeGridPlugin from '@fullcalendar/timegrid';

import 'csspin/csspin.css';
import 'pikaday/css/pikaday.css';

import './meetings.css';

import './logo.png';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const calendars = {};

$(function() {
    let calOptions = {
        header : {
            left : '',
            center : '',
            right : ''
        },
        weekends : true,
        editable : false,
        defaultView : 'timeGridDay',
        allDaySlot : false,
        locales : [ ruLocale ],
        minTime : '10:00',
        maxTime : '21:00',
        height : 737,
        displayEventEnd : true,
        nowIndicator: true,
        timezone: 'local',
        plugins: [ timeGridPlugin, momentPlugin ],
        eventRender: (info) => {
            tippy(info.el, {
                content: info.event.title
            });
        }
    };

    const dateSelector = new Pikaday({
         field: $('#select-date')[0],
         format: "L",
         onSelect: (date) => {
             Object.keys(calendars).forEach(calId => {
                 calendars[calId].gotoDate(date);
             });
         }
    });

    function updateTime() {
        $('#current-time').text(moment().format("HH:mm"));
    }

    function showLoading(elementId, show) {
        let loadingId = elementId+"_load";
        $("#"+loadingId).remove();
        if (show) {
            let parent = $("#"+elementId);
            let params = {
                    id: loadingId,
                    x: parent.offset().left+parent.width()/2 - 5,
                    y: parent.offset().top+parent.height()/3 - 5
            };
            parent.append($($.templates("#tpl-loading").render(params)));
        }
    }

    $.get('/api/rooms', function(data) {

        $.each(data, (idx, room) => {
            let calId = 'cal_' + room.id;
            let callLoadingError = (id, status) => {
                return () => {
                    showLoading(id, status);
                };
            };
            let opts = {
                room_data : {
                    id : calId,
                    title : room.name,
                    description : room.description
                },

                eventSources : [
                    ( fetchInfo, successCallback, failureCallback ) => {
                        return fetch('/api/calendar/' + room.id +
                            "?start="+encodeURIComponent(moment(fetchInfo.start).format())+
                            "&end="+encodeURIComponent(moment(fetchInfo.end).format()))
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Failed to fetch data');
                                    }
                                    return response.json();
                                })
                                .then(events => {
                                    showLoading(calId, false);
                                    events.forEach(ev => {
                                        ev.title = ev.title.replace(/^mailto:/, '');
                                    })
                                    successCallback(events);
                                    return events;

                                })
                                .catch(err => {
                                    showLoading(calId, true);
                                    $("#"+calId).oneTime("20s", () => {
                                        calendars[calId].refetchEvents();
                                    });
                                    failureCallback(err);
                                });
                    }
            ]
            };

            $.extend(opts, calOptions);

            $("#meetings_holder").append($($.templates("#tpl-room").render(opts.room_data)));

            const calend = new Calendar($("#" + calId).get(0), opts);
            calendars[calId] = calend;

            $("#" + calId).everyTime("60s", () => {
                const date = toMoment(calend.getDate(), calend);
                if (!date.startOf('day').isSame(moment().startOf('day'))) {
                    calend.today();
                } else {
                    calend.refetchEvents();
                }
                $('#select-date').val('');
            });

            calend.render();
            $("#cal_legend").append($($.templates("#tpl-legend").render(opts.room_data)));

        });
    });


    $("#current-time").everyTime("10s", function() {
        updateTime();
    });

    updateTime();
});
