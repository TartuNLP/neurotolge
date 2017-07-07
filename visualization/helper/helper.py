#!/usr/bin/python
#  -*- encoding: utf-8 -*-


def parse_alignments(non_formatted_alignments):
    formatted_alignments = []
    for i in range(len(non_formatted_alignments)):
        alignments = []
        for element in non_formatted_alignments[i].spit("|"):
            alignments.append([sub_element.strip() for sub_element in element.strip()[1:-1].split(" ")])
        formatted_alignments.append(alignments)
    return formatted_alignments


def format_response_object():
    pass
