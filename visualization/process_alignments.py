# coding: utf-8

import alignment_metrics as metrics


import sys, getopt
import numpy as np
import os
import webbrowser
import math
import ntpath
from time import gmtime, strftime
from io import open, StringIO
from imp import reload

try:
    from itertools import izip
except ImportError:
    izip = zip


def printHelp():
    print (
    'process_alignments.py -i <input_file> [-o <output_type>] [-f <from_system>] [-s <source_sentence_file>] [-t <target_sentence_file>]')
    print ('input_file is the file with alignment weights (required)')
    print ('source_sentence_file and target_sentence_file are required only for NeuralMonkey')
    print ('output_type can be web (default), block, block2 or color')
    print ('from_system can be Nematus or NeuralMonkey (default)')


def printColor(value):
    colors = [
        '[48;5;232m[K  [m[K',
        '[48;5;233m[K  [m[K',
        '[48;5;234m[K  [m[K',
        '[48;5;235m[K  [m[K',
        '[48;5;236m[K  [m[K',
        '[48;5;237m[K  [m[K',
        '[48;5;238m[K  [m[K',
        '[48;5;239m[K  [m[K',
        '[48;5;240m[K  [m[K',
        '[48;5;240m[K  [m[K',
        '[48;5;241m[K  [m[K',
        '[48;5;242m[K  [m[K',
        '[48;5;243m[K  [m[K',
        '[48;5;244m[K  [m[K',
        '[48;5;245m[K  [m[K',
        '[48;5;246m[K  [m[K',
        '[48;5;247m[K  [m[K',
        '[48;5;248m[K  [m[K',
        '[48;5;249m[K  [m[K',
        '[48;5;250m[K  [m[K',
        '[48;5;251m[K  [m[K',
        '[48;5;252m[K  [m[K',
        '[48;5;253m[K  [m[K',
        '[48;5;254m[K  [m[K',
        '[48;5;255m[K  [m[K',
        '[48;5;255m[K  [m[K',
    ]
    num = int(math.floor((value - 0.01) * 25))
    if num < 0: num = 0
    sys.stdout.write(colors[num])


def printBlock2(value):
    blocks2 = ['██', '▉▉', '▊▊', '▋▋', '▌▌', '▍▍', '▎▎', '▏▏', '  ', ]
    num = int(math.floor((value - 0.01) * 8))
    if num < 0: num = 0
    sys.stdout.write(blocks2[num])


def printBlock(value):
    blocks = ['██', '▓▓', '▒▒', '░░', '  ', ]
    num = int(math.floor((value - 0.01) * 4))
    if num < 0: num = 0
    sys.stdout.write(blocks[num])


def readSnts(filename):
    with open(filename, 'r', encoding='utf-8') as fh:
        return [escape(line).strip().split() for line in fh]


def readNematus(filename):
    with open(filename, 'r', encoding='utf-8') as fh:
        alis = []
        tgts = []
        srcs = []
        wasNew = True
        aliTXT = ''
        for line in fh:
            if wasNew:
                if len(aliTXT) > 0:
                    c = StringIO(aliTXT)
                    ali = np.loadtxt(c)
                    ali = ali.transpose()
                    alis.append(ali)
                    aliTXT = ''
                lineparts = line.split(' ||| ')
                lineparts[1] += ' <EOS>'
                lineparts[3] += ' <EOS>'
                tgts.append(escape(lineparts[1]).strip().split())
                srcs.append(escape(lineparts[3]).strip().split())
                wasNew = False
                continue
            if line != '\n' and line != '\r\n':
                aliTXT += line
            else:
                wasNew = True
        if len(aliTXT) > 0:
            c = StringIO(aliTXT)
            ali = np.loadtxt(c)
            ali = ali.transpose()
            alis.append(ali)
            aliTXT = ''
    return srcs, tgts, alis


def escape(string):
    return string.replace('"', '&quot;').replace("'", "&apos;")


def readAmu(in_file, src_file):
    with open(src_file, 'r', encoding='utf-8') as fi:
        with open(in_file, 'r', encoding='utf-8') as fh:
            alis = []
            tgts = []
            srcs = []
            aliTXT = ''
            for src_line, out_line in izip(fi, fh):
                lineparts = out_line.split(' ||| ')
                lineparts[0] += ' <EOS>'
                src_line = src_line.strip() + ' <EOS>'
                tgts.append(escape(lineparts[0]).strip().split())
                srcs.append(escape(src_line).split())
                # alignment weights
                weightparts = lineparts[1].split(') | (')
                for weightpart in weightparts:
                    aliTXT += weightpart.replace('(', '') + '\n'
                if len(aliTXT) > 0:
                    c = StringIO(aliTXT.replace(' ) | ', ''))
                    ali = np.loadtxt(c)
                    ali = ali.transpose()
                    alis.append(ali)
                    aliTXT = ''
    return srcs, tgts, alis


def main(argv):
    try:
        opts, args = getopt.getopt(argv, "hi:o:s:t:f:n:")
    except getopt.GetoptError:
        printHelp()
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            printHelp()
            sys.exit()
        elif opt == '-i':
            inputfile = arg
        elif opt == '-o':
            outputType = arg
        elif opt == '-s':
            sourcefile = arg
        elif opt == '-t':
            targetfile = arg
        elif opt == '-f':
            from_system = arg
        elif opt == '-n':
            num = arg
    try:
        inputfile
    except NameError:
        print ('Provide an input file!')
        printHelp()
        sys.exit()
    try:
        from_system
    except NameError:
        from_system = 'NeuralMonkey'
    try:
        num
    except NameError:
        num = -1
    try:
        outputType
    except NameError:
        # Set output type to 'web' by default
        outputType = 'web'
    if from_system == 'NeuralMonkey' or from_system == 'AmuNMT':
        try:
            sourcefile
        except NameError:
            print ('Provide a source sentence file!')
            printHelp()
            sys.exit()
        if from_system == 'NeuralMonkey':
            try:
                targetfile
            except NameError:
                print ('Provide a target sentence file!')
                printHelp()
                sys.exit()
    if outputType != 'color' and outputType != 'block' and outputType != 'block2':
        # Set output type to 'web' by default
        outputType = 'web'

    if from_system == "NeuralMonkey":
        srcs = readSnts(sourcefile)
        tgts = readSnts(targetfile)
        alis = np.load(inputfile)
    if from_system == "Nematus":
        (srcs, tgts, alis) = readNematus(inputfile)

    #NOTE: Reformating data code
    if from_system == "AmuNMT":
        (srcs, tgts, alis) = readAmu(inputfile, sourcefile)

    data = list(zip(srcs, tgts, alis))
    # END NOTE


    foldername = ntpath.basename(inputfile).replace(".", "") + "_" + strftime("%d%m_%H%M", gmtime())
    folder = './web/data/' + foldername
    try:
        os.stat(folder)
    except:
        os.mkdir(folder)

    with open(folder + "/" + ntpath.basename(inputfile) + '.ali.js', 'w', encoding='utf-8') as out_a_js:
        with open(folder + "/" + ntpath.basename(inputfile) + '.src.js', 'w', encoding='utf-8') as out_s_js:
            with open(folder + "/" + ntpath.basename(inputfile) + '.trg.js', 'w', encoding='utf-8') as out_t_js:
                with open(folder + "/" + ntpath.basename(inputfile) + '.con.js', 'w', encoding='utf-8') as out_c_js:
                    with open(folder + "/" + ntpath.basename(inputfile) + '.sc.js', 'w', encoding='utf-8') as out_sc_js:
                        out_a_js.write(u'var alignments = [\n')
                        out_s_js.write(u'var sources = [\n')
                        out_t_js.write(u'var targets = [\n')
                        out_c_js.write(u'var confidences = [\n')
                        out_sc_js.write(u'var sentence_confidences = [\n')
                        num = int(num) - 1
                        if num > -1 and (num < len(data)):
                            data = [data[num]]
                        for i in range(0, len(data)):
                            (src, tgt, rawAli) = data[i]
                            ali = [l[:len(tgt)] for l in rawAli[:len(src)]]

                            srcTotal = []
                            trgTotal = []
                            tali = np.array(ali).transpose()
                            for a in range(0, len(ali)):
                                srcTotal.append(str(math.pow(math.e, -0.05 * math.pow(
                                    (metrics.getCP([ali[a]]) + metrics.getEnt([ali[a]]) + metrics.getRevEnt([ali[a]])),
                                    2))))
                            for a in range(0, len(tali)):
                                trgTotal.append(str(math.pow(math.e, -0.05 * math.pow((metrics.getCP(
                                    [tali[a]]) + metrics.getEnt([tali[a]]) + metrics.getRevEnt([tali[a]])), 2))))

                            # Get the confidence metrics
                            CDP = round(metrics.getCP(ali), 10)
                            APout = round(metrics.getEnt(ali), 10)
                            APin = round(metrics.getRevEnt(ali), 10)
                            Total = round(CDP + APout + APin, 10)
                            # e^(-1(x^2))
                            CDP_pr = round(math.pow(math.e, -1 * math.pow(CDP, 2)) * 100, 2)
                            # e^(-0.05(x^2))
                            APout_pr = round(math.pow(math.e, -0.05 * math.pow(APout, 2)) * 100, 2)
                            APin_pr = round(math.pow(math.e, -0.05 * math.pow(APin, 2)) * 100, 2)
                            Total_pr = round(math.pow(math.e, -0.05 * math.pow(Total, 2)) * 100, 2)
                            # 1-e^(-0.0001(x^2))
                            Len = round((1 - math.pow(math.e, -0.0001 * math.pow(len(" ".join(src)), 2))) * 100, 2)

                            out_s_js.write('["' + " ".join(src).replace(' ', '", "') + '"], \n')
                            out_t_js.write('["' + " ".join(tgt).replace(' ', '", "') + '"], \n')
                            out_c_js.write(
                                u'[' + repr(CDP_pr) + u', ' + repr(APout_pr) + u', ' + repr(APin_pr) + u', ' + repr(
                                    Total_pr)
                                + u', ' + repr(Len) + u', ' + repr(len(" ".join(src))) + u'], \n')
                            out_sc_js.write(
                                u'[[' + ", ".join(srcTotal) + u'], ' + u'[' + ", ".join(trgTotal) + u'], ' + u'], \n')

                            word = 0
                            out_a_js.write(u'[')
                            for ali_i in ali:
                                linePartC = 0
                                for ali_j in ali_i:
                                    out_a_js.write(u'[' + repr(word) + u', ' + str(np.round(ali_j, 8)) + u', ' + repr(
                                        linePartC) + u'], ')
                                    linePartC += 1
                                    if outputType == 'color':
                                        printColor(ali_j)
                                    elif outputType == 'block':
                                        printBlock(ali_j)
                                    elif outputType == 'block2':
                                        printBlock2(ali_j)
                                if outputType != 'web':
                                    sys.stdout.write(src[word])
                                word += 1
                                if outputType != 'web':
                                    sys.stdout.write('\n')

                            # write target sentences
                            # build 2d array
                            occupied_to = []
                            outchars = []
                            outchars.append([])
                            tw = 0
                            for tword in tgt:
                                columns = len(tgt)
                                # Some characters use multiple symbols. Need to decode and then encode...
                                twchars = list(tword)
                                twlen = len(twchars)
                                xpos = tw * 2
                                emptyline = 0

                                for el in range(0, len(occupied_to)):
                                    # if occupied, move to a new line!
                                    if occupied_to[el] < xpos:
                                        emptyline = el
                                        if len(outchars) < emptyline + 1:
                                            # add a new row
                                            outchars.append([])
                                        break
                                    if el == len(occupied_to) - 1:
                                        emptyline = el + 1
                                        if len(outchars) < emptyline + 1:
                                            outchars.append([])

                                for column in range(0, xpos):
                                    if len(outchars[emptyline]) <= column:
                                        outchars[emptyline].append(' ')

                                for charindex in range(0, twlen):
                                    if xpos + charindex == len(outchars[emptyline]):
                                        outchars[emptyline].append(twchars[charindex])
                                    else:
                                        outchars[emptyline][charindex] = twchars[charindex]

                                if len(occupied_to) <= emptyline:
                                    occupied_to.append(xpos + twlen + 1)
                                else:
                                    occupied_to[emptyline] = xpos + twlen + 1;
                                tw += 1

                            # print 2d array
                            if outputType != 'web':
                                for liline in outchars:
                                    sys.stdout.write(''.join(liline) + '\n')
                                # print scores
                                sys.stdout.write('\nCoverage Deviation Penalty: \t\t' + repr(CDP) + ' (' + repr(
                                    CDP_pr) + '%)' + '\n')
                                sys.stdout.write('Input Absentmindedness Penalty: \t' + repr(APin) + ' (' + repr(
                                    APin_pr) + '%)' + '\n')
                                sys.stdout.write('Output Absentmindedness Penalty: \t' + repr(APout) + ' (' + repr(
                                    APout_pr) + '%)' + '\n')
                                sys.stdout.write(
                                    'Confidence: \t\t\t\t' + repr(Total) + ' (' + repr(Total_pr) + '%)' + '\n')

                            # write target sentences
                            word = 0
                            out_a_js.write(u'], \n')
                            if outputType != 'web':
                                sys.stdout.write('\n')
                        out_a_js.write(u'\n]')
                        out_s_js.write(u']')
                        out_t_js.write(u']')
                        out_c_js.write(u']')
                        out_sc_js.write(u']')

    # Get rid of some junk
    if outputType == 'web':
        webbrowser.open("http://127.0.0.1:47155/?directory=" + foldername)
        os.system("php -S 127.0.0.1:47155 -t web")
    else:
        os.remove(folder + "/" + ntpath.basename(inputfile) + '.ali.js')
        os.remove(folder + "/" + ntpath.basename(inputfile) + '.src.js')
        os.remove(folder + "/" + ntpath.basename(inputfile) + '.trg.js')
        os.remove(folder + "/" + ntpath.basename(inputfile) + '.con.js')
        os.remove(folder + "/" + ntpath.basename(inputfile) + '.sc.js')
        os.rmdir(folder)


if __name__ == "__main__":
    if sys.version[0] == '2':
        reload(sys)
        sys.setdefaultencoding('utf-8')
    main(sys.argv[1:])
