## Setting up the udp-client
(German version see below)

**All the steps described below apply only to the client computer on which the VOC sensor is connected (Not on the computer on which ioBroker is running).**

For the example client, a Raspberry Pi with the current Raspbian buster(light) installed is assumed.

On the client computer to which the VOC sensor is connected, the user must also be granted write permissions for this USB device. Since access is via the kernel driver, the udev rule is slightly different.
For the Raspbian standard user "pi" you can create a udev rule as follows:
Create a file named “90-voc-monitor_udp-client.rules“ in folder /etc/udev/rules.d/ with following content (root permission required):

    SUBSYSTEMS=="usb", KERNEL=="hidraw*", ATTRS{idVendor}=="03eb", ATTRS{idProduct}=="2013", GROUP="plugdev", SYMLINK+="voc-monitor"

Alternative copy the file “90-voc-monitor_udp-client.rules“ from folder “rules_and_tools” (root permission required)

This rule automatically assigns the USB-Device with ID 03eb:2013 to the group “plugdev”, in which the default user "pi" is a member. Additionally creates a link called “voc-monitor” in the device folder “/dev/” when plugged in. This guarantees that the sensor can always be addressed with the same device name.

To read the VOC sensor and send the data via network to the ioBroker server, you have to copy the program “voc-monitor_udp-client.py" from the folder “rules_and_tools” to the user’s home directory (default: “/home/pi/”).
To be able to run the program, the authorization must be adjusted with:

    chmod 0755 /home/pi/voc-monitor_udp-client.py

The program can then be started as follows:

    python /home/pi/voc-monitor_udp-client.py

At the first start, the program asks for the IP address of the ioBroker server and for the ioBroker adapter port.
These data are stored in the file “voc-monitor_udp-client.conf” and do not need to be entered each time you run the programm.   
If the IP address and/or the port has to be changed, the program can be started with the argument --config and The IP address and port are queried again.

The measured values should then appear in the terminal of the client computer.
In the ioBroker-adapter, the VOC sensor is then automatically created with the client IP address.   
Finished!?

Nearly!   
If you want to operate the VOC sensor permanently via the client computer, you should do the following steps.
If the program was started as described above, it must now be stopped by simultaneously pressing "Ctrl" and "c".

In order for the client program to run in the background, the program "screen" is required and can be installed as follows:

    sudo apt-get install screen

This changes the startup command for the program on the client machine as follows:

    screen -dmS voc-monitor python /home/pi/voc-monitor_udp-client.py

To the voc-monitor session, which is now running in the background, you connect with the following command:

    screen -r voc-monitor

To leave the voc-monitor session without stopping it, press "Ctrl" and "a" simultaneously, then release both keys and press "d".

To restart the program automatically after disconnecting and reconnecting the sensor or after restart the client, a little watchdog program is set up as cronjob. This checks every minute if the voc-monitor session is still running and if not, it will be restarted:

Therefore create a file with the name "watchdog_voc-monitor.sh" In the folder "/home/pi/"  with the following content:

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


Alternative copy the file “watchdog_voc-monitor.sh“ from folder “rules_and_tools”.

To be able to run the program, the authorization must be adjusted with:

    chmod 0755 /home/pi/watchdog_voc-monitor.sh

To set up a cronjob, run the following command:

    crontab -e

The cron config opens in a text editor.
Add the following line at the end:

    * * * * * $HOME/watchdog_voc-monitor.sh >/dev/null 2>&1

Save the changes:   
In the Raspian default text editor "nano": Press "Ctrl" and "o" simultaneously, then confirm the query of the file name with return.

Finally exit the editor:   
In the Raspian default text editor "nano": Press "Ctrl" and "x" simultaneously.

---

## Einrichten eines udp-Client

**Alle ab hier beschriebenen Schritte beziehen sich ausschließlich auf den Client-Rechner, an dem der USB VOC-Sensor angeschlossen werden soll! (Also nicht auf den Rechner auf dem ioBroker läuft)**

Als Beispiel-Client wird hier ein Raspberry-Pi mit installiertem aktuellem Raspbian-Buster(light) angenommen.

Am Client-Rechner an dem der USB VOC-Sensor angeschlossen werden soll, müssen dem Benutzer ebenfalls Schreibrechte für dieses USB-Gerät erteilt werden.
Da hier der Zugriff über den Kerneltreiber geschieht, ist die udev-Regel etwas anders.
Für den Raspbian Standardbenutzer "pi" kann man wie folgt eine udev-Regel erstellen:

Im Verzeichnis "/etc/udev/rules.d" eine Datei mit dem namen "90-airsensor_udp-client.rules" mit folgenden Inhalt anlegen (root Rechte erforderlich):

	SUBSYSTEMS=="usb", KERNEL=="hidraw*", ATTRS{idVendor}=="03eb", ATTRS{idProduct}=="2013", GROUP="plugdev", SYMLINK+="voc-monitor"

Alternativ kann die Datei "90-voc-monitor_udp-client.rules" aus dem Ordner "rules_and_tools" kopiert werden (root Rechte erforderlich).

Durch diese Regel wird das USB-Gerät mit der ID 03eb:2013 automatisch der Gruppe „plugdev“ zugewiesen, in der der Standardbenutzer „pi“ Mitglied ist. Außerdem wird im Geräteordner „/dev/“ beim Einstecken ein Link mit dem Namen „voc-monitor“ angelegt. Damit ist sichergestellt, dass der Sensor immer mit dem gleichen Gerätenamen angesprochen werden kann.

Um den USB VOC-Sensor auszulesen und die Daten über Netzwerk an den ioBroker-Server zu senden, ist das Programm "voc-monitor_udp-client.py" aus dem Ordner "rules_and_tools" in das home Verzeichnis des Client-Rechners (Standard: /home/pi/) zu kopieren.
Damit das Programm ausgeführt werden kann, muss die Berechtigung angepasst werden:

	chmod 0755 /home/pi/voc-monitor_udp-client.py

Das Programm kann dann wie folgt gestartet werden:

	python /home/pi/voc-monitor_udp-client.py

Beim ersten Start fragt das Programm nach der IP-Adresse des ioBroker-Servers und nach dem ioBroker Adapter Port.
Diese Daten werden in der Datei "voc-monitor_udp-client.conf" gespeichert und müssen dann nicht bei jedem Start eingegeben werden.   
Soll die IP-Adresse und/oder der Port geändert werden, so kann das Programm mit dem Argument --config gestartet werden und die IP-Adresse und der Port werden erneut abgefragt.

Danach sollten die Messwerte im Terminal des Client-Rechners erscheinen. Im ioBroker Adapter wird der USB VOC-Sensor dann automatisch mit der Client IP-Adresse angelegt.   
Fertig.


Beinahe!   
Wer den Sensor dauerhaft über den Client-Rechner betreiben will, sollte noch die folgenden Schritte ausführen.
Wenn das Programm wie oben beschrieben gestartet wurde, muss es nun durch gleichzeitiges Drücken von „Strg“ und „c“ erstmal wieder beendet werden.

Damit das Programm im Hintergrund laufen kann, wird auf dem Client-Rechner das Programm "screen" benötigt und kann wie folgt installiert werden:

	sudo apt-get install screen

Damit ändert sich der Startbefehl für das Programm auf dem Client-Rechner folgendermaßen:

	screen -dmS voc-monitor python /home/pi/voc-monitor_udp-client.py

Auf die jetzt im Hintergrund laufende voc-monitor-Session verbindet man sich mit dem Befehl:

	screen -r voc-monitor

Um die Session wieder zu verlassen ohne diese zu beenden drückt man gleichzeitig "Strg" und "a", danach beide Tasten wieder loslassen und "d" drücken.

Da das Programm nach dem Aus- und Wiedereinstecken des USB-Kabels zum Sensor oder bei Neustart des Clients wieder automatisch starten soll, wird noch die Ausführung eines Überwachungsprogramms als cronjob eingerichtet, das jede Minute überprüft ob die airsensor-Session noch im Hintergrund läuft und wenn nicht, wird diese neu gestartet:

Dazu im Verzeichnis "/home/pi/" eine Datei mit dem namen "watchdog_voc-monitor.sh" mit folgendem Inhalt anlegen:

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

Alternativ kann die Datei "watchdog_voc-monitor.sh" aus dem Ordner "rules_and_tools" kopiert werden.

Damit das Programm ausgeführt werden kann, muss die Berechtigung angepasst werden:

	chmod 0755 /home/pi/watchdog_voc-monitor.sh

Zum Einrichten eines cronjobs muss folgender Befehl ausgeführt werden:

	crontab -e

Daraufhin öffnet sich die cron config in einem Text-Editor.
Am Ende folgende Zeile hinzufügen:

	* * * * * /home/pi/watchdog_voc-monitor.sh >/dev/null 2>&1

Die Änderung speichern:
Im Raspian Standard Text-Editor "nano": Gleichzeitig "Strg" und "o" drücken, dann die Abfrage des Dateinamens mit return bestätigen.  
Schließlich den Editor beenden:
Im Raspian Standard Text-Editor "nano": Gleichzeitig „Strg“ und „x“ drücken.