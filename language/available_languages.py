#!/usr/bin/python
#  -*- encoding: utf-8 -*-

language_titles_in_estonian = {'et': 'Eesti', 'en': 'Inglise', 'fi': 'Soome'}
language_titles_in_english = {'et': 'Estonian', 'en': 'English', 'fi': 'Finnish'}


# Finnish language is disabled
def get_available_language_culture_name_tuples():
    return [("et", "en"), ("en", "et")] # ("et", "fi"), ("fi", "et")]


def get_available_language_culture_name_dicts():
    language_culture_name_pairs = get_available_language_culture_name_tuples()
    return [{lang_from: lang_to} for lang_from, lang_to in language_culture_name_pairs]


def get_language_titles(language):
    if language == 'et':
        return language_titles_in_estonian
    elif language == 'en':
        return language_titles_in_english

    print("Language titles were not found. Convert to default language titles.")
    return language_titles_in_estonian


def culture_names(language='et'):
    language_culture_name = dict()
    languages = get_available_language_culture_name_tuples()
    language_titles = get_language_titles(language)
    for lang_from, lang_to in languages:

        if lang_from in language_culture_name:
            language_culture_name[lang_from] = language_titles[lang_from]

        if lang_to in language_titles_in_english:
            language_culture_name[lang_to] = language_titles[lang_to]

    return language_culture_name
