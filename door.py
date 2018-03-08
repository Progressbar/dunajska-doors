#!/usr/bin/python3
import RPi.GPIO as GPIO
from time import sleep
import sys

PIN_ACCEPT = 23
PIN_END = 24
PIN_ZERO = 25
PIN_CALLING = 22
RELAY_ON = 1
RELAY_OFF = 0

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM) # or BCM
GPIO.setup(PIN_ACCEPT, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(PIN_END, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(PIN_ZERO, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(PIN_CALLING, GPIO.IN)


def bottom_door():
    GPIO.output(PIN_END, RELAY_ON)
    sleep(0.3)
    GPIO.output(PIN_END, RELAY_OFF)
    sleep(0.2)
    GPIO.output(PIN_ZERO, RELAY_ON)
    sleep(2)
    GPIO.output(PIN_ZERO, RELAY_OFF)
    sleep(0.3)
    GPIO.output(PIN_ACCEPT, RELAY_ON)
    sleep(0.3)
    GPIO.output(PIN_ACCEPT, RELAY_OFF)
    sleep(8)        
    GPIO.output(PIN_ZERO, RELAY_ON)
    sleep(0.3)
    GPIO.output(PIN_ZERO, RELAY_OFF)
    sleep(0.2)
    GPIO.output(PIN_ZERO, RELAY_ON)
    sleep(0.3)
    GPIO.output(PIN_ZERO, RELAY_OFF)
    sleep(5)
    GPIO.output(PIN_END, RELAY_ON)
    sleep(0.3)
    GPIO.output(PIN_END, RELAY_OFF)


def bottom_door_answer():
    GPIO.output(PIN_ACCEPT, RELAY_ON)
    sleep(0.3)
    GPIO.output(PIN_ACCEPT, RELAY_OFF)
    sleep(0.4)        
    GPIO.output(PIN_ZERO, RELAY_ON)
    sleep(0.3)
    GPIO.output(PIN_ZERO, RELAY_OFF)
    sleep(0.2)
    GPIO.output(PIN_ZERO, RELAY_ON)
    sleep(0.3)
    GPIO.output(PIN_ZERO, RELAY_OFF)
    sleep(1)
    GPIO.output(PIN_END, RELAY_ON)
    sleep(0.3)
    GPIO.output(PIN_END, RELAY_OFF)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "open":
            bottom_door()
        elif sys.argv[1] == "answer":
            bottom_door_answer()
    else:
        print("Parameter not recognized!")
        print("Possible options:\n./door.py open\n./door.py answer")
