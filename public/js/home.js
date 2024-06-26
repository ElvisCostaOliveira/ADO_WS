document.addEventListener('DOMContentLoaded', function () {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('username='));
    if (cookieValue) {
        const username = decodeURIComponent(cookieValue.split('=')[1]);
        document.getElementById('username').textContent = username;
    } else {
        document.getElementById('username').textContent = 'Usuário não identificado';
    }

    const totalDentroDoPrazo = parseFloat(localStorage.getItem('totalDentroDoPrazo')) || 0;
    const totalVencido = parseFloat(localStorage.getItem('totalVencido')) || 0;
    const totalPagos = parseFloat(localStorage.getItem('totalPagos')) || 0;

    axios.get('/receber')
        .then(response => {
            const data = response.data;
            console.log(data);

            // Gráfico de Contas a Pagar
            const ctxPagar = document.getElementById('chartPagar').getContext('2d');
            const chartPagar = new Chart(ctxPagar, {
                type: 'pie',
                data: {
                    labels: ['Dentro do Prazo', 'Total Vencido', 'Total Pago'],
                    datasets: [{
                        label: 'Total a Pagar R$',
                        data: [totalDentroDoPrazo, totalVencido, totalPagos],
                        backgroundColor: ['green', 'red', 'blue']
                    }]
                }
            });





            // Gráfico de Contas a Receber
            const totalPago = parseFloat(localStorage.getItem('totalPago')) || 0;
            const totalAReceber = parseFloat(localStorage.getItem('totalAReceber')) || 0;

            const ctxReceber = document.getElementById('chartReceber').getContext('2d');
            const chartReceber = new Chart(ctxReceber, {
                type: 'pie',
                data: {
                    labels: ['Total Pago', 'Total a Receber'],
                    datasets: [{
                        label: 'Total a Receber R$',
                        data: [totalPago, totalAReceber],
                        backgroundColor: ['yellow', 'purple']
                    }]
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar transações:', error);
        });
});