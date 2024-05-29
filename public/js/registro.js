
document.getElementById('registro').addEventListener('submit', function (event) {
    event.preventDefault();
    var nome = document.getElementById('nome').value;
    var email = document.getElementById('email').value;
    var senha = document.getElementById('senha').value;

    axios.post('/registro', { nome, email, senha })
        .then(function (response) {
            window.location.href = '/pagar';
        })
        .catch(function (error) {
            alert('Registro falhou: ' + error.response.data);
        });

    if (!nome.trim()) {
        alert('Por favor, insira o seu nome.');
        event.preventDefault(); 
    } else if (!email) {
        alert('Por favor, insira o seu email.');
        event.preventDefault(); 
    } else if (!senha) {
        alert('Por favor, insira a sua senha.');
        event.preventDefault(); 
    }



});
