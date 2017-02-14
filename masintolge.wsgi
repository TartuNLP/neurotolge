import sys
sys.path.append('/vhosts/masintolge/masintolge')

from masintolge import app as application

if __name__ == "__main__":
    application.run(threaded=True)

