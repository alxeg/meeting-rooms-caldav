import 'babel-polyfill';
import moment from 'moment';

import $ from 'jquery';

import 'fullcalendar';
import 'fullcalendar/dist/locale/ru';
import Pikaday from 'pikaday/pikaday';

import 'jsrender';
import './jquery.timers.min';

import 'fullcalendar/dist/fullcalendar.css';
import 'csspin/csspin.css';
import 'pikaday/css/pikaday.css';

import './meetings.css';

import './logo.png';

$(function() {
    let calOptions = {
        header : {
            left : '',
            center : '',
            right : ''
        },
        weekends : false,
        editable : false,
        defaultView : 'agendaDay',
        allDaySlot : false,
        locale : 'ru',
        minTime : '10:00',
        maxTime : '21:00',
        height : 737,
        displayEventEnd : true,
        nowIndicator: true,
        timezone: 'local'
    };

    let dateSelector = new Pikaday({
         field: $('#select-date')[0],
         format: "L",
         onSelect: (date) => {
            $('.room_calendar').fullCalendar('gotoDate', date);
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

                eventSources : [ {
                    url : '/api/calendar/' + room.id,
                    type : 'GET',
                    eventDataTransform: event => {
                        event.title = event.title.replace(/^mailto:/, '');
                        return event;
                    },
                    error: () => {
                        showLoading(calId, true);
                        $("#"+calId).oneTime("20s", function() {
                            $(this).fullCalendar('refetchEvents');
                        });
                    },
                    success: function() {
                        showLoading(calId, false);
                    }
                } ]
            };

            $.extend(opts, calOptions);

            $("#meetings_holder").append($($.templates("#tpl-room").render(opts.room_data)));
            $("#" + calId).fullCalendar(opts).everyTime("60s", function() {
                let cal = $(this);
                if (!cal.fullCalendar('getDate').stripTime().isSame(moment().stripTime())) {
                    cal.fullCalendar('today');
                } else {
                    cal.fullCalendar('refetchEvents');
                }
                $("#select-date").val("");
            });
            $("#cal_legend").append($($.templates("#tpl-legend").render(opts.room_data)));

        });
    });


    $("#current-time").everyTime("10s", function() {
        updateTime();
    });

    updateTime();
});
