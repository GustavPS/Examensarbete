window.onload  = () => {
    var redirect_uri = getParameter("redirect_uri");
    if (redirect_uri === null) {
        document.getElementById('callbackError').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
    }
    document.getElementById('redirect_uri').value = redirect_uri;
    getError();
};

getParameter = (name) => {
    var url_string = window.location.href
    var url = new URL(url_string);
    return url.searchParams.get(name);
}

getError = () => {
    let error = getParameter('error');
    if (error === 'username_password') {
        document.getElementById('error').innerHTML = "Wrong username and/or password, please try again.";
    }
}

getCookie = (name) => {

    var value = "; " + document.cookie;
    console.log(value);
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }