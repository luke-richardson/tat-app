The easiest way to use Django is to first set up a virtualenv.

1. Make sure you have Python 3.4 _not_ Python 2.7

2. Install pip https://pypi.python.org/pypi/pip

3. Install virtualenv
$ pip install virtualenv

4. Create the virtualenv (OUTSIDE the git repo)
$ mkdir ../virtualenv
$ virtualenv python=python3.4 ../virtualenv

5. Activate the virtualenv 
$ source ../virtualenv/bin/activate

6. Install packages required for python environment
$ pip install -r requirements.txt

7. Use Django manage.py to do things (like run the server)
$ python manage.py runserver

NB: Always work inside the virtualenv. If you don't then it's YOUR fault if something breaks because I don't have a package, or it isn't on the server.
When you install a new package and decide that it is required for the project then you need to add it to the requirements.txt document
$ pip freeze > requirements.txt

Afterwards, change the Django line to the following URL, this is needed because we are using a rc build of Django (like most people).
https://www.djangoproject.com/download/1.7c2/tarball/

This won't be necessary once 1.7 is released.

BUGS:
1. Login modal breaks after a number of attempts when you're switching between states and stuff.

IMPORTANT:
Remember to remove self-signed SSL workaround from inkapp/platforms/ios/inkapp/Classes/AppDelegate.m when you have a proper signed certificate.
@implementation NSURLRequest(DataController) to @end

Install cordova facebook login for android
