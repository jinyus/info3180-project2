/* Add your Application JavaScript */

event = new Vue();

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
        userPath: ""
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
      <router-link class="post-btn btn btn-primary font-weight-bold" to="/posts/new">New Post<span class="sr-only">(current)</span></router-link>
    `
});

const Profile = Vue.component('profile', {
    template: `

    `
});

const Posts = Vue.component('posts', {
    template: `
    <form>
      <h1>New Post</h1>
      <div class="form">
        <label>Photo</label>
        <input type="file" name="photo" class="form-group form-control"/>
        <label>Caption</label>
        <textarea name="caption" class="form-group form-control" placeholder="Write a caption..."></textarea>
        <input type="submit" class="form-control btn btn-success font-weight-bold" value="Submit"/>
      </div>
    </form>
    `
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
        userPath: ""
      }
    },
    
    created() {
      let self = this;
      event.$on("loggedIn", function(id){
        self.userPath = "/users/" + id;
      });
    },
    
    routes: [
        {path: "/", component: Home },
        {path: "/login", component: Login_form},
        {path: "/register", component: Register_form},
        {path: "/explore", component: Explore},
        {path: "" + this.userPath, component: Profile},
        {path: "/posts/new", component: Posts},
        {path: "/logout", component: Logout}
    ]
});

// Instantiate our main Vue Instance
let app = new Vue({
    el: "#app",
    data : {
        token : ''
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
    router
});