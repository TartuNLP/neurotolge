#!/usr/bin/python
#  -*- coding: utf-8 -*-

import time
import requests


def save_google_translation(queue, source_text, client_id, client_secret, translate_from='et', translate_to='en'):
    translation = ''

    try:
        begin = time.time()
        translation = google_translation(source_text,
                                         translate_from=translate_from,
                                         translate_to=translate_to)
        end = time.time()
        print("Google", end - begin)

    except Exception as e:

        print("Google failed!", e)

    queue.put({'translation_google': translation})
    return None


def google_translation(text, translate_from='et', translate_to='en'):

    response = requests.get(url)
    translation = response['data']['translations'][0]['translatedText']
    print("Test", translation)
    return translation
