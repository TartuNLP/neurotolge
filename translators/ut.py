#!/usr/bin/python
#  -*- encoding: utf-8 -*-


import time
import socket
import sys


def ut_translation(queue, text, translate_from='et', translate_to='en'):
    try:
        __HOST__ = "booster2.hpc.ut.ee"
        __PORT__ = 50007
        __BUFFER_SIZE__ = 4096

        delimiter = "|||"
        text_for_translation = u"{source}{delimiter}" \
                               u"{lang_from}{delimiter}{lang_to}".format(source=text,
                                                                         delimiter=delimiter,
                                                                         lang_from=translate_from,
                                                                         lang_to=translate_to)

        begin = time.time()
        s = socket.socket()
        s.connect((__HOST__, __PORT__))

        s.send(text_for_translation.encode('utf-8'))

        translation = s.recv(__BUFFER_SIZE__).replace("|||", "")
        s.close()
        end = time.time()

        print("ut", translation, text_for_translation)
        print("ut/time : ", end - begin)
    except Exception as e:
        print("ut exception", e.message)
        translation = ""

    queue.put({'translation_ut': translation})

    return None
