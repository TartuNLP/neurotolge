#!/usr/bin/python
#  -*- coding: utf-8 -*-


import time
import requests
import socket
import sys


def ut_translation(queue, text, translate_from='et', translate_to='en'):
    try:
        __HOST__ = "booster2.hpc.ut.ee"
        __PORT__ = 50007
        __BUFFER_SIZE__ = 1024

        delimiter = "|||"
        text_for_translation = u"%s%s%s%s%s" % (text.encode("utf-8"),
                                                delimiter,
                                                translate_from.encode("utf-8"),
                                                delimiter,
                                                translate_to.encode("utf-8"))

        s = socket.socket()
        s.connect((__HOST__, __PORT__))
 
        print >> sys.stderr, "test-text", text_for_translation

        s.send(text_for_translation)

        translation = s.recv(__BUFFER_SIZE__).replace("|||", "")
        s.close()

        print("ut", translation)
    except Exception as e:
        print("ut exception", e.message)
        translation = ""

    queue.put({'translation_ut': translation})

    return None
