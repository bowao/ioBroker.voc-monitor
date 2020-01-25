#!/bin/bash
# watchdog
#
### CONFIG - START
PROG=$HOME/voc-monitor_udp-client.py
SCRNAME=voc-monitor
### CONFIG - END

#SCRIPT started ?
PID="$(screen -list | grep $SCRNAME)"
echo "$PID"
if [[ ! -z "$PID" ]] ; then
    echo "$(date +"%Y-%m-%d %H:%M")    Watchdog - $PROG runs"
else
    screen -dmS $SCRNAME python $PROG
    echo "$(date +"%Y-%m-%d %H:%M")    Watchdog - $PROG has been restarted"
fi

exit 0

