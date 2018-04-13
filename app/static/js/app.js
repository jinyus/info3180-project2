/* Add your Application JavaScript */
Vue.component('app-header', {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <a class="navbar-brand" href="#">Lab 7</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
    
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <router-link class="nav-link" to="/">Home <span class="sr-only">(current)</span></router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/login">Login<span class="sr-only">(current)</span></router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/register">Register<span class="sr-only">(current)</span></router-link>
          </li>
        </ul>
      </div>
    </nav>
    `
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
    <div class="jumbotron">
        <h1>Lab 7</h1>
        <p class="lead">In this lab we will demonstrate VueJS working with Forms and Form Validation from Flask-WTF.</p>
    </div>
   `,
    data: function() {
       return {}
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
        <label>Username</label>
        <input type="text" name="username" class="form-group form-control">
        <label>Password</label>
        <input type="password" name="password" class="form-group form-control">
        <input type="submit" class="btn btn-primary" >
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
    routes: [
        { path: "/", component: Home },
        {path: "/login", component: Login_form}
    ]
});

// Instantiate our main Vue Instance
let app = new Vue({
    el: "#app",
    router
});