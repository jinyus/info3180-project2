/* Add your Application JavaScript */

let event = new Vue();

Vue.component('app-header', {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <a class="navbar-brand" href="#"><i class="logo fa fa-camera"></i>Photogram</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
    
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ml-auto">
          <li v-if="!loggedIn" class="nav-item active">
            <router-link class="nav-link" to="/">Home<span class="sr-only">(current)</span></router-link>
          </li>
          <li v-if="loggedIn" class="nav-item">
            <router-link class="nav-link" to="/explore">Explore<span class="sr-only">(current)</span></router-link>
          </li>
          <li v-if="loggedIn" class="nav-item">
            <router-link class="nav-link" :to="userPath">My Profile<span class="sr-only">(current)</span></router-link>
          </li>
          <li v-if="!loggedIn" class="nav-item">
            <router-link class="nav-link" to="/register">Register<span class="sr-only">(current)</span></router-link>
          </li>
          <li v-if="!loggedIn" class="nav-item">
            <router-link class="nav-link" to="/login">Login<span class="sr-only">(current)</span></router-link>
          </li>
          <li v-if="loggedIn" class="nav-item">
            <router-link class="nav-link" to="/logout">Logout<span class="sr-only">(current)</span></router-link>
          </li>
        </ul>
      </div>
    </nav>
    `,
    
    data: function(){
      return {
        loggedIn: false,
        userPath: "",
        IDholder:null
      }
    },
    
    methods: {
      show: function() {
        this.loggedIn = !this.loggedIn;
      }
    },
    
    created() {
        let self = this;
        event.$on("loggedIn", function(id){
          self.show();
          self.userPath = "/users/" + id;
      });
      
      event.$on("loggedOut", function(){
          self.show();
      });
      
      event.$on("PostCompCreated", function(){
        event.$emit("IDsignal", self.IDholder);
    });
    }
});

Vue.component('app-footer', {
    template: `
    <footer>
        <div class="container">
            <p>Copyright &copy; Flask Inc.</p>
        </div>
    </footer>
    `
});

const Home = Vue.component('home', {
   template: `
   <div class="row home">
     <div class="col-md-6" id="home-img"></div>
     <div class="col-md-6" id="home-card">
        <div class="logo-text"><i class="logo fa fa-camera"></i>Photogram</div>
        <hr/>
        <p>Share photos of your favourite moments with friends, family and the world.</p>
        <div class="home-btns">
          <router-link class="d-inline-block nav-link btn btn-success font-weight-bold" to="/register">Register<span class="sr-only">(current)</span></router-link>
          <router-link class="home-login-btn d-inline-block nav-link btn btn-primary font-weight-bold" to="/login">Login<span class="sr-only">(current)</span></router-link>
        </div>
     </div>
   </div>
   `,
    data: function() {
       return {}
    }
});

const Explore = Vue.component('explore', {
    template: `
    <div>
      <router-link class="post-btn btn btn-primary font-weight-bold" to="/posts/new">New Post<span class="sr-only">(current)</span></router-link>
      <div v-for="post in posts">
        <div v-html="post"></div>
      </div>
    </div>
    `,
    
    data : function(){
      return {
        posts: []
      }
    },
    
    created : function(){
      let self = this;
      let post = '';
      fetch("/api/posts/", {
      method: 'GET',
      headers: {
          'X-CSRFToken': token
          },
          credentials: 'same-origin'
      })
      .then(function (response) {
          return response.json();
      })
      .then(function (jsonResponse) {
      // display a success message
        console.log(jsonResponse);
        
        let p = jsonResponse.posts;
        for (i = 0; i < p.length; i++){
          post += '<div class="form, post"><div class="post-header"><a href="#/users/' + p[i].userid + 
                  '"><img src="static/uploads/' + p[i].profile_pic + '"/><span>' + p[i].Post_creator + '</span></a>' +
                  '</div><div class="posted-img text-center"><img src="static/uploads/' + p[i].pic + '"/></div>' +
                  '<div class="caption">' + p[i].caption + '</div><div class="post-footer">' + 
                  '<span><span class="like-icon"><i class="fa fa-heart-o"></i></span>' + p[i].likes +
                  ' Likes</span><span class="float-right">' + p[i].created_on + '</span></div></div>';
          
          self.posts.push(post);
          post = '';
        }
      })
      .catch(function (error) {
          console.log(error);
      });
    }
});

const Profile = Vue.component('profile', {
    template: `
    <div>
      <div class="form profile-header">
        <img class="float-left" :src="photo"/>
        <div class="profile-right float-right text-center">
          <div class="num-posts float-left">
            <p class="font-weight-bold">{{post_count}}<p/>
            <p>Posts<p/>
          </div>
          <div class="followers float-right">
            <p class="font-weight-bold">{{followers}}<p/>
            <p>Followers<p/>
          </div>
        </div>
        <div class="profile-mid">
          <p class="font-weight-bold p-name">{{firstname}} {{lastname}}</p>
          <p>{{location}}</p>
          <p>Member since {{joined}}</p>
          <p class="p-bio">{{bio}}</p>
        </div>
      </div>
      
      <div class="grid-wrapper">
        <div v-for="post in userPosts" class="grid-item">
          <img :src="post.photo" :id="post.postID" @click="viewPost($event)" data-toggle="modal" data-target="#myModal"/>
        </div>

        <div class="modal fade" id="myModal" role="dialog">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <div class="post-header"><img id="modal-profile-pic"/><span id="modal-username"></span></div>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title"></h4>
              </div>
              <div class="text-center modal-body">
                <img id="modal-photo"/>
                <div id="modal-caption" class="caption"></div>
              </div>
              <div class="modal-footer">
                <span><span class="like-icon float-left"><i class="fa fa-heart-o"></i></span><span id="modal-likes" class="font-weight-bold"></span></span>
                <span id="modal-date"class="font-weight-bold"></span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
    `,
    
    // <div class="follow-btn font-weight-bold">Follow</div>
    
    data(){
      return{
        userPosts: [],
        photo: "",
        firstname: "",
        lastname: "",
        location: "",
        bio: "",
        joined: "",
        followers: "",
        post_count: ""
      }
    },
    
    methods: {
      viewPost: function(e) {
        let self = this;
        let modalPhoto = document.querySelector("#modal-photo");
        let modalCaption = document.querySelector("#modal-caption");
        let modalLikes = document.querySelector("#modal-likes");
        let modalDate = document.querySelector("#modal-date");
        let modalProfilePic = document.querySelector("#modal-profile-pic");
        let modalUsername = document.querySelector("#modal-username");
        for (i = 0; i < self.userPosts.length; i++) {
          if (self.userPosts[i].postID == e.currentTarget.id) {
            modalPhoto.setAttribute("src", self.userPosts[i].photo);
            modalCaption.innerHTML =  self.userPosts[i].caption;
            modalLikes.innerHTML =  self.userPosts[i].likes + " Likes";
            modalDate.innerHTML =  self.userPosts[i].created;
            modalProfilePic.setAttribute("src", self.userPosts[i].profilePic);
            modalUsername.innerHTML =  self.userPosts[i].username;;
          }
        }
      }
    },
    
    created : function(){
      let self = this;
      fetch("/api/u/" + this.$parent.userID, {
      method: 'GET',
      headers: {
          'X-CSRFToken': token
          },
          credentials: 'same-origin'
      })
      .then(function (response) {
          return response.json();
      })
      .then(function (jsonResponse) {
      // display a success message
        console.log(jsonResponse);
        
        let user = jsonResponse.user_info[0];
        self.photo = "static/uploads/" + user.profile_pic;
        self.firstname = user.firstname;
        self.lastname = user.lastname;
        self.location = user.location;
        self.bio = user.bio;
        self.joined = user.joined;
        self.followers = user.follower_count;
        self.post_count = user.posts_count;
      })
      .catch(function (error) {
          console.log(error);
      });
      
      fetch("/api/users/" + this.$parent.userID + "/posts", {
      method: 'GET',
      headers: {
          'X-CSRFToken': token
          },
          credentials: 'same-origin'
      })
      .then(function (response) {
          return response.json();
      })
      .then(function (jsonResponse) {
      // display a success message
        console.log(jsonResponse);
        
        let p = jsonResponse.posts;
        for (i = 0; i < p.length; i++){
          self.userPosts.push({
            "photo": "static/uploads/" + p[i].pic, 
            "postID": p[i].id,
            "caption": p[i].caption,
            "created": p[i].created_on,
            "likes": p[i].likes,
            "profilePic": "static/uploads/" + p[i].profile_pic,
            "username": p[i].Post_creator
          });
        }
      })
      .catch(function (error) {
          console.log(error);
      });
    }
});

const Posts = Vue.component('posts', {
    template: `
    <div>
      <div v-if="visible">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-else class="alert alert-success">Post created successfully</div>
      </div>
        
      <form @submit.prevent="post(); visible=true" id="post-form">
        <h1>New Post</h1>
        <div class="form">
          <label>Photo</label>
          <input type="file" name="photo" class="form-group form-control"/>
          <label>Caption</label>
          <textarea name="caption" class="form-group form-control" placeholder="Write a caption..."></textarea>
          <input type="submit" class="form-control btn btn-success font-weight-bold" value="Submit"/>
        </div>
      </form>
    </div>
    `,
    
    data : function(){
      return {
        error: null,
        visible: false
      }
    },
    
    methods : {
      post : function(){
        let self = this;
        let postForm = document.getElementById('post-form');
        let form_data = new FormData(postForm);
        fetch("/api/users/" + this.$parent.userID + "/posts", {
        method: 'POST',
        body : form_data,
        headers: {
            'X-CSRFToken': token
            },
            credentials: 'same-origin'
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonResponse) {
        // display a success message
          if (jsonResponse.error == true) {self.error = jsonResponse.message;}
          console.log(jsonResponse);
        })
        .catch(function (error) {
            console.log(error);
        });
      }
    }
});

const Login_form = Vue.component('login-form', {
    template: `
    <div>
        <div v-if="visible">
            <div v-if="errors" class="alert alert-danger">
                <li v-for="error in errors">{{ error }}</li>
            </div>
            <div v-else class="alert alert-success">Logged in Successful</div>
        </div>
    
    <form @submit.prevent="LogIn();visible = true" id="LoginForm">
        <h1>Login</h1>
        <div class="form">
            <label>Username</label>
            <input type="text" name="username" class="form-group form-control"/>
            <label>Password</label>
            <input type="password" name="password" class="form-group form-control"/>
            <input type="submit" class="form-control btn btn-primary font-weight-bold" value="Login"/>
        </div>
    </form>
    </div>
    `,
    methods : {
        LogIn : function(){
            let self = this;
            
            let LoginForm = document.getElementById('LoginForm');
            let form_data = new FormData(LoginForm);
            fetch("/api/auth/login", {
            method: 'POST',
            body : form_data,
            headers: {
                'X-CSRFToken': token
                },
                credentials: 'same-origin'
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (jsonResponse) {
            // display a success message
                self.errors = jsonResponse.errors;
                if (jsonResponse.errors == null) {
                  event.$emit("loggedIn", jsonResponse.id);
                  router.push('explore');
                }
                console.log(jsonResponse);
            })
            .catch(function (error) {
                console.log(error);
            });
                    }
            },
        data : function(){
            return {
                errors:[],
                visible: false
            }
        }
});

const Logout = Vue.component('logout', {
    template: `

    `,
    
    created : function() {
      fetch("/api/auth/logout", {
      method: 'POST',
      headers: {
          'X-CSRFToken': token
          },
          credentials: 'same-origin'
      })
      .then(function (response) {
          return response.json();
      })
      .then(function (jsonResponse) {
      // display a success message
          self.errors = jsonResponse.errors;
          if (jsonResponse.errors == null) {
            event.$emit("loggedOut");
            router.push('/');
          }
          console.log(jsonResponse);
      })
      .catch(function (error) {
          console.log(error);
      });
    }
});


const Register_form = Vue.component('register-form', {
    template: `
    <div>
        <div v-if="visible">
            <div v-if="errors" class="alert alert-danger">
                <li v-for="error in errors">{{ error }}</li>
            </div>
            <div v-else class="alert alert-success">Registered Successful</div>
        </div>
    
    <form @submit.prevent="Register();visible = true" id="RegisterForm">
        <h1>Register</h1>
        <div class="form">
            <label>Username</label>
            <input type="text" name="username" class="form-group form-control"/>
    
            <label>Password</label>
            <input type="password" name="password" class="form-group form-control"/>
    
            <label>First Name</label>
            <input type="text" name="firstname" class="form-group form-control"/>
    
            <label>Last Name</label>
            <input type="text" name="lastname" class="form-group form-control"/>
    
            <label>Gender</label>
            <select name="gender" class="form-group form-control">
                <option value="m" name="male">Male</option>
                <option value="f" name="female">Female</option>
            </select>
        
            <label>Email</label>
            <input type="text" name="email" class="form-group form-control"/>
    
            <label>Location (City, Country)</label>
            <input type="text" name="location" class="form-group form-control"/>
    
            <label>Biography</label>
            <textarea name="biography" class="form-group form-control"></textarea>
    
            <label>Profile Photo</label>
            <input type="file" name="photo" class="form-group form-control"/>
            
            <input type="submit" class="form-control btn btn-success font-weight-bold" value="Register"/>
        </div>
    </form>
    </div>
    `,
    methods : {
        Register : function(){
            let self = this;
            
            let RegisterForm = document.getElementById('RegisterForm');
            let form_data = new FormData(RegisterForm);
            fetch("/api/users/register", {
            method: 'POST',
            body : form_data,
            headers: {
                'X-CSRFToken': token
                },
                credentials: 'same-origin'
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (jsonResponse) {
            // display a success message
                self.errors = jsonResponse.errors;
                console.log(jsonResponse);
            })
            .catch(function (error) {
                console.log(error);
            });
                    }
            },
        data : function(){
            return {
                errors:[],
                visible: false
            }
        }
});


// Define Routes
const router = new VueRouter({
    data: function(){
      return {
        userPath: "",
        userid : null
      }
    },
    
    created() {
      let self = this;
      event.$on("loggedIn", function(id){
        self.userPath = "/users/" + id;
        self.userid=id;
      });
    },
    
    routes: [
        {path: "/", component: Home },
        {path: "/login", component: Login_form},
        {path: "/register", component: Register_form},
        {path: "/explore", component: Explore},
        //{path: "" + this.userPath, component: Profile},
        {path: "/users/:userid", component: Profile},
        {path: "/testing", component: Profile},
        {path: "/posts/new", component: Posts},
        {path: "/logout", component: Logout}
    ]
});

// Instantiate our main Vue Instance
let app = new Vue({
    el: "#app",
    data : {
        token : '',
        userID: null
    },
    methods: {
        // Usually the generation of a JWT will be done when a user either registers
        // with your web application or when they login.
        getToken: function () {
            let self = this;

            fetch('/token')
                .then(function (response) {
                    return response.json();
                })
                .then(function (response) {
                    let jwt_token = response.data.token;

                    // We store this token in localStorage so that subsequent API requests
                    // can use the token until it expires or is deleted.
                    localStorage.setItem('token', jwt_token);
                    console.info('Token generated and added to localStorage.');
                    self.token = jwt_token;
                })
        },
        // Remove token stored in localStorage.
        // Usually you will remove it when a user logs out of your web application
        // or if the token has expired.
        removeToken: function () {
            localStorage.removeItem('token');
            console.info('Token removed from localStorage.');
            alert('Token removed!');
        }
    },
    
    created : function() {
      let self = this;
      event.$on("loggedIn", function(id){
        self.userID =  id;
      });
    },
    
    router
});