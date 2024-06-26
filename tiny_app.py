'''
  Credit to Jeff Ondich for basic flask app
    "A tiny Flask web application, including API, to be used
    as a template for setting up your web app assignment."
'''
import sys
import argparse
import flask
import api

app = flask.Flask(__name__, static_folder='static', template_folder='templates')
app.register_blueprint(api.api, url_prefix='/api')

from flask_util_js import FlaskUtilJs
# For flask_util.url_for() in JavaScript: https://github.com/dantezhu/flask_util_js
fujs = FlaskUtilJs(app)

# This route delivers the user your site's home page.
@app.route('/')
def home():
    return flask.render_template('visPage_newdraft.html')

@app.route('/general_info')
def general_info():
    '''
    This should render the template for information page
        for our input formats and distance measures
    '''
    return flask.render_template('general_info.html')

# This route supports relative links among your web pages, assuming those pages
# are stored in the templates/ directory or one of its descendant directories,
# without requiring you to have specific routes for each page.
@app.route('/<path:path>')
def shared_header_catchall(path):
    return flask.render_template(path)

if __name__ == '__main__':
    parser = argparse.ArgumentParser('A tiny Flask application, including API')
    parser.add_argument('host', help='the host on which this application is running')
    parser.add_argument('port', type=int, help='the port on which this application is listening')
    arguments = parser.parse_args()
    app.run(host=arguments.host, port=arguments.port, debug=True)
