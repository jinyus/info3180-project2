from . import db
from werkzeug.security import generate_password_hash, check_password_hash

## Profile Table to store user profile information
class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(80))
    password = db.Column(db.String())
    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))
    gender = db.Column(db.String(20))
    email = db.Column(db.String(255))
    location = db.Column(db.String(255))
    biography = db.Column(db.String(255))
    pic = db.Column(db.String(255))
    joined_on = db.Column(db.String(80))
    
    def __init__(self, uname,password, fname, lname, gender, email, location, bio, pic, joined):
        self.user_name = uname
        self.password = generate_password_hash(password)
        self.first_name = fname
        self.last_name = lname
        self.gender = gender
        self.email = email
        self.location = location
        self.biography = bio
        self.pic = pic
        self.joined_on = joined
        
        

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        try:
            return unicode(self.id)  # python 2 support
        except NameError:
            return str(self.id)  # python 3 support

    def __repr__(self):
        return "<User (username = '%s', firstname= '%s' joined: '%s' )>" % (self.user_name, self.first_name, self.joined_on)

##Posts Table to store user posts information
class UserPosts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    pic = db.Column(db.String(255))
    caption = db.Column(db.String(255))
    created_on = db.Column(db.String(80))
    
    def __init__(self, postid, userid, pic, caption, created):
        self.id = postid
        self.user_id = self.userid
        self.pic = pic
        self.caption = caption
        self.created_on = created

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        try:
            return unicode(self.id)  # python 2 support
        except NameError:
            return str(self.id)  # python 3 support

    def __repr__(self):
        return '<User %r>' % (self.first_name)

##Likes Tbale to user likes information  
class UserLikes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    post_id = db.Column(db.Integer)
    
    def __init__(self, likeid, userid, postid):
        self.id = likeid
        self.user_id = self.userid
        self.post_id = postid

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        try:
            return unicode(self.id)  # python 2 support
        except NameError:
            return str(self.id)  # python 3 support

    def __repr__(self):
        return '<User %r>' % (self.first_name)
 
 
##Follow table to store the id number of a user they are following   

#NOTICE  File "/home/ubuntu/workspace/app/models.py", line 117, in UserFollows
#    user_id = db.Column(db.Integer(7))
#     TypeError: object() takes no parameters
# You can't put 7 in the bracket because Integer doesn't take a value
class UserFollows(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    follow_id = db.Column(db.Integer)
    
    def __init__(self, followid, userid, followerid):
        self.id = followid
        self.userid = userid
        self.follow_id = followerid

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        try:
            return unicode(self.id)  # python 2 support
        except NameError:
            return str(self.id)  # python 3 support

    def __repr__(self):
        return '<User %r>' % (self.first_name)