document.addEventListener('DOMContentLoaded', function() {
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

    axios.get('/get-transactions')
        .then(response => {
            const data = response.data;
            console.log(data); // Verificar dados

            // Gráfico de Contas a Pagar
            const ctxPagar = document.getElementById('chartPagar').getContext('2d');
            const chartPagar = new Chart(ctxPagar, {
                type: 'pie',
                data: {
                    labels: ['Total em Dia', 'Total Vencido', 'Total Pago'],
                    datasets: [{
                        label: 'Total a Pagar',
                        data: [totalDentroDoPrazo, totalVencido, totalPagos], // Use dados estáticos para teste
                        backgroundColor: ['green', 'red', 'blue']
                    }]
                }
            });

            // Gráfico de Contas a Receber
            const ctxReceber = document.getElementById('chartReceber').getContext('2d');
            const chartReceber = new Chart(ctxReceber, {
                type: 'pie',
                data: {
                    labels: ['Total em Receber', 'Total Vencido', 'Total Recebido'],
                    datasets: [{
                        label: 'Total a Receber',
                        data: [15, 25, 35], // Use dados estáticos para teste
                        backgroundColor: ['yellow', 'purple', 'orange']
                    }]
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar transações:', error);
        });
});