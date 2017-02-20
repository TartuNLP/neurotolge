#!/usr/bin/python
#  -*- encoding: utf-8 -*-


import time
import requests
import json


def save_google_translation(queue, source_text, translate_from='et', translate_to='en'):
    translation = ''

    translation_time_begin = time.time()
    try:
        translation = google_translation(source_text,
                                         translate_from=translate_from,
                                         translate_to=translate_to)
        print("google", translation)

    except Exception as e:

        print("google failed!", e)

    translation_time_end = time.time()

    print("google/time : ", translation_time_end - translation_time_begin)

    queue.put({'translation_google': translation})
    return None


def google_translation(text, translate_from='et', translate_to='en'):

    response = requests.get(url)
    json_response = json.loads(response.text)
    translation = json_response['data']['translations'][0]['translatedText']
    return translation
