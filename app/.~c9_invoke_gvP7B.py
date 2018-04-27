"""
Flask Documentation:     http://flask.pocoo.org/docs/
Jinja2 Documentation:    http://jinja.pocoo.org/2/documentation/
Werkzeug Documentation:  http://werkzeug.pocoo.org/documentation/
This file creates your application.
"""

from app import app, db, login_manager
from werkzeug.utils import secure_filename
from flask import render_template, request, redirect, url_for, flash,jsonify,abort,g 
import os
from forms import RegisterForm, LoginForm, PostsForm
from datetime import datetime
from models import UserProfile, UserPosts,UserFollows,UserLikes
from flask_login import login_user, logout_user, current_user, login_required
#import jwt
from flask import _request_ctx_stack
from functools import wraps
import base64


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
            userData = {'id': newuser.id, 
            'email': newuser.email,
            'usernname': newuser.user_name, 
            'gender': newuser.gender, 
            'firstname': newuser.first_name, 
            'lastname': newuser.last_name, 
            'location': newuser.location, 
            'bio': newuser.biography, 
            'profile_pic': newuser.pic, 
            'joined': newuser.joined_on}
            
            return jsonify(error = er , data = {"newuser": userData}, message = msg)
        else:
            msg = "Username and/or email already exist"
            return jsonify(error=[msg], message="Username and/or email already exist")
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
            
            if user is not None and user.check_password(password):
                login_user(user)
                
                er = None
                msg = "User successfully logged in."
                return jsonify(errors = er , message = msg, id = user.id)
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
        msg = "User successfully logged out."
        return jsonify(errors = er, message = msg)
    else:
        abort(405)
        
@app.route('/api/allposts/', methods=['GET'])
def allPosts():
    if request.method == 'GET':
        allposts = UserPosts.query.all().items
        er =None
        msg = "All Posts by all users"
        return jsonify(errors = er, message = msg, posts=allposts)
    else:
        abort(405)
        
@app.route('/api/users/<userid>/posts', methods=['GET','POST'])
def userPosts(userid):
    form = PostsForm()
    if request.method == 'GET':
        user = UserProfile.query.filter_by(id = userid).first()
        if user is not None:
            userposts = UserPosts.query.filter_by(user_id = userid ).items
            if userposts is not None:
                msg = "All post by user successfully fetched"
                er = None
                return jsonify(error=er,message=msg,posts=userposts)
            else:
               er = True
               msg = "User has no posts"
               return jsonify(error=er,message=msg)
        else:
            er=True
            msg = "User does not exist"
            return jsonify(error=er,message=msg)
    elif request.method == 'POST':
        if form.validate_on_submit():
            if current_user.id == userid:
                pic = form.photo.data
                caption =  form.caption.data
                date = format_date_joined(datetime.now())
                newpost  =UserPosts(userid,pic,caption, date)
                db.session.add(newpost)
                db.session.commit()
                
                er = None
                msg = "Post created successfully"
                return jsonify(error=er, message=msg)
            else:
                er=True
                msg = "You can only create posts for yourself. You id is {} and you are trying to create a post for user with the id {}".format(current_user.id, userid)
                return jsonify(error=er , message = msg)
                
@app.route('/api/users/<userid>/follow',methods = ['POST'])
def follow(userid):
    if request.method == 'POST':
        current = current_user
        target = UserProfile.query.filter_by(id = userid).first()
        if target is not None:
            new_follow_relationship = UserFollows(current.id,target.id)
            db.session.add(new_follow_relationship)
            db.session.commit()
            er = None
            msg ="{} is now following {}".format(current.user_name,target.user_name)
            return jsonify(error=er,message=msg)
        else:
            er = True
            msg ="Target user doesn't exists"
            return jsonify(error=er,message=msg)
    else:
        abort(405)

@app.route('/api/posts/<postid>/like', methods=['POST'])
def like(postid):
    if request.method == 'POST':
        user = current_user
        post = UserPosts.query.filter_by(id = postid).first()
        if post is not None:
            new_like = UserLikes(user.id,post.id)
            db.session.add(new_like)
            db.session.commit()
        
            er=None
            msg ="{} liked this post".format(user.user_name)
            return jsonify(error=er,message=msg)
        else:
            er=True
            msg ="Invalid post id"
            return jsonify(error=er,message=msg)
    else:
        abort(405)
        
@app.route('/token')
def generate_token():
    payload = {'sub': '12345', 'name': 'John Doe'}
    token = jwt.encode(payload, 'some-secret', algorithm='HS256')

    return jsonify(error=None, data={'token': token}, message="Token Generated")


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

def requires_auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    auth = request.headers.get('Authorization', None)
    if not auth:
      return jsonify({'code': 'authorization_header_missing', 'description': 'Authorization header is expected'}), 401

    parts = auth.split()

    if parts[0].lower() != 'bearer':
      return jsonify({'code': 'invalid_header', 'description': 'Authorization header must start with Bearer'}), 401
    elif len(parts) == 1:
      return jsonify({'code': 'invalid_header', 'description': 'Token not found'}), 401
    elif len(parts) > 2:
      return jsonify({'code': 'invalid_header', 'description': 'Authorization header must be Bearer + \s + token'}), 401

    token = parts[1]
    try:
         payload = jwt.decode(token, 'some-secret')

    except jwt.ExpiredSignature:
        return jsonify({'code': 'token_expired', 'description': 'token is expired'}), 401
    except jwt.DecodeError:
        return jsonify({'code': 'token_invalid_signature', 'description': 'Token signature is invalid'}), 401

    g.current_user = user = payload
    return f(*args, **kwargs)

  return decorated
    
@login_manager.user_loader
def load_user(id):
    return db.session.query(UserProfile).get(int(id))
    
    
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
