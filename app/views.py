"""
Flask Documentation:     http://flask.pocoo.org/docs/
Jinja2 Documentation:    http://jinja.pocoo.org/2/documentation/
Werkzeug Documentation:  http://werkzeug.pocoo.org/documentation/
This file creates your application.
"""

from app import app, db
from werkzeug.utils import secure_filename
from flask import render_template, request, redirect, url_for, flash,jsonify,abort
import os
from forms import RegisterForm, LoginForm
from datetime import datetime
from models import UserProfile
from flask_login import login_user, logout_user, current_user, login_required




###
# Routing for your application.
###

@app.route('/')
def index():
    """Render the initial webpage and then let VueJS take control."""
    return render_template('index.html')
        
@app.route('/api/users/register', methods=['POST'])
def register():
    form = RegisterForm()
    if request.method == 'POST' and form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        firstname = form.firstname.data
        lastname = form.lastname.data
        gender = form.gender.data
        email = form.email.data
        location = form.location.data
        biography = form.biography.data
        photo = form.photo.data
        joined = format_date_joined(datetime.now())
        
        user = db.session.query(UserProfile).filter_by(user_name=username).first()
        eml = db.session.query(UserProfile).filter_by(email=email).first()
        
        if user is None and eml is None:
            filename = secure_filename(photo.filename)
            photo.save(os.path.join(
            app.config['UPLOAD_FOLDER'], filename
            ))
        
            #photoUrl = url_for('static', filename="uploads/" + filename)
            
            
            newuser = UserProfile(username,password,firstname,lastname,gender,email,location,biography,filename,joined)
            db.session.add(newuser)
            db.session.commit()
            
            er = None
            msg = "User Create Successfully"
            
            return jsonify(error = er , message = msg)
        else:
            return jsonify(error=True, message="Username and/or email already exist")
    else:
        return jsonify(errors = form_errors(form))

@app.route('/api/auth/login', methods=['POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        if form.validate_on_submit():
            username = form.username.data
            password = form.password.data
            
            user = db.session.query(UserProfile).filter_by(user_name=username).first()
            
            if user is not None and user.password == password:
                login_user(user)
                
                er = None
                msg = "User successfully logged in."
                return jsonify(errors = er , message = msg)
            else:
                er = True
                msg = 'Invalid username or password'
                return jsonify(errors = [msg], message = msg)
        else:
            return jsonify(errors = form_errors(form))
    else:
        abort (405)
        
@app.route('/api/auth/logout', methods=['POST'])
def logout():
    if request.method == 'POST':
        logout_user()
        er =None
        msg = "User successfully logged in."
        return jsonify(errors = er, message = msg)
    else:
        abort(405)
        

        
        
    


###
# The functions below should be applicable to all Flask apps.
###

def form_errors(form):
    error_messages = []
    """Collects form errors"""
    for field, errors in form.errors.items():
        for error in errors:
            message = u"Error in the %s field - %s" % (
                    getattr(form, field).label.text,
                    error
                )
            error_messages.append(message)

    return error_messages

def format_date_joined(d):
    return d.strftime("%b, %Y");
    
    
@app.route('/<file_name>.txt')
def send_text_file(file_name):
    """Send your static text file."""
    file_dot_text = file_name + '.txt'
    return app.send_static_file(file_dot_text)


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also tell the browser not to cache the rendered page. If we wanted
    to we could change max-age to 600 seconds which would be 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


@app.errorhandler(404)
def page_not_found(error):
    """Custom 404 page."""
    return render_template('404.html'), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Custom 405 page."""
    return render_template('405.html'), 405


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port="8080")
