#!/usr/bin/python
#  -*- coding: utf-8 -*-

from flask import Flask, render_template, request
import json
import requests

app = Flask(__name__)

# Translators
from help.parallel_translation_requests import get_translations
from language.available_languages import get_available_language_culture_name_pairs, \
                                         language_culture_names_to_estonian, \
                                         language_culture_names_to_english

app.jinja_env.globals['available_language_pairs'] = get_available_language_culture_name_pairs()

app.jinja_env.globals['language_culture_names_to_estonian'] = \
    language_culture_names_to_estonian(get_available_language_culture_name_pairs())
app.jinja_env.globals['language_culture_names_to_english'] = \
            language_culture_names_to_english(get_available_language_culture_name_pairs())


@app.route('/', methods=['GET', 'POST'])
def main_page():
    if request.method == 'POST' and 'source_text' in request.json:
        language_translate_from = request.json['translate_from']
        language_translate_to = request.json['translate_to']
        source_text = request.json['source_text']

        # TODO refactor
        # Hidden credentials:

        translations = get_translations(source_text, language_translate_from, language_translate_to)
        # translations = {"translation_ut": "Hello", "translation_google": "", "translation_microsoft": ""}
        translation_google = translations['translation_google']
        translation_microsoft = translations['translation_microsoft']
        translation_ut = translations['translation_ut']

        # Insert Query in DB
        # insert(source_text, translation_microsoft, translation_google, translation_ut)

        return json.dumps({
            'status': 'OK',
            'translations': [
                {'translator': 'google', 'translation': translation_google},
                {'translator': 'ut', 'translation': translation_ut},
                {'translator': 'microsoft', 'translation': translation_microsoft}
            ]
        })

    elif request.method == 'POST':
        print(request.json)

        return "OK", 201

    return render_template('index-et.html')


@app.route('/<language>', methods=['GET'])
def get_main_page(language):
    try:
        return render_template('index-{lang}.html'.format(lang=language))
    except Exception as e:
        return render_template('index-en.html')


@app.route('/about/<language>', methods=['GET'])
def about_page_estonian(language):
    try:
        return render_template('about-{lang}.html'.format(lang=language))
    except Exception as e:
        return render_template('about-en.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0')
