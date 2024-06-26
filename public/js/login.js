document.getElementById('login').addEventListener('submit', function(event) {
    event.preventDefault();
    var email = document.getElementById('email').value;
    var senha = document.getElementById('senha').value;

    axios.post('/login', { email, senha })
        .then(function(response) {
            window.location.href = '/pagar';
        })
        .catch(function(error) {
            alert('Login falhou: ' + error.response.data);
        });

    if (!email) {
        alert('Por favor, insira o seu email.');
        event.preventDefault(); 
    } else if (!senha) {
        alert('Por favor, insira a sua senha.');
        event.preventDefault(); 
    } else if (!validarEmail(email)) {
        alert('Por favor, insira um endereço de email válido.');
        event.preventDefault(); 
    }

    function validarEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
