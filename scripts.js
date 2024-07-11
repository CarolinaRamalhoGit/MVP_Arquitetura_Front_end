/*
  --------------------------------------------------------------------------------------
  Definindo as variáveis globais
  --------------------------------------------------------------------------------------
*/
const urlListaProdutos = "http://127.0.0.1:5000/lista_produtos";
const urlListaProdutosPorNome = "http://127.0.0.1:5000/lista_produtos_por_nome";
const urlConsultaProdutoPorId = "http://127.0.0.1:5000/produto";
const urlAddProduto = "http://127.0.0.1:5000/produto";
const urlDeleteProduto = "http://127.0.0.1:5000/produto";
const urlUpdateProduto = "http://127.0.0.1:5000/produto";;
let idProduto = "";

/*
  --------------------------------------------------------------------------------------
  Função para obter a lista de produtos
  -------------------------------------------------------------------------------------- 
*/
async function getListaProdutos() {
    try {
        const response = await fetch(urlListaProdutos, { method: 'get' });
        const data = await response.json();

        //Verificando se a data.Lista de produtos é um array
        if (Array.isArray(data["Lista de produtos"])) {

            // Ordenando a lista de produtos pela data de validade
            data["Lista de produtos"].sort((a, b) => {
                const dataValidadeA = new Date(Date.parse(a.validade));
                const dataValidadeB = new Date(Date.parse(b.validade));
                return dataValidadeA - dataValidadeB;
            });

            // Exibindo a lista de produtos na tabela
            const table = document.getElementById("myTable");
            data["Lista de produtos"].forEach((item) => {
                const row = table.insertRow();
                const nome = row.insertCell();
                nome.textContent = item.nome;
                const quantidade = row.insertCell();
                quantidade.textContent = item.quantidade;
                const validade = row.insertCell();

                // Convertendo a string de validade para um objeto Date
                const dataValidade = new Date(Date.parse(item.validade));

                // Ajustando para garantir que a data seja tratada como UTC
                const dataValidadeUTC = new Date(dataValidade.getUTCFullYear(), dataValidade.getUTCMonth(), dataValidade.getUTCDate());

                // Verificando se a data é válida e transformando-a em string no formato brasileiro
                if (isNaN(dataValidadeUTC)) {
                    validade.textContent = "Data Inválida";
                } else {

                    // Formatando a data para o formato brasileiro sem a hora
                    validade.textContent = dataValidadeUTC.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    });
                }

                // Adicionando o botão de editar
                const editar = row.insertCell();
                editar.innerHTML = '<img src="ícones/editar.png" alt="Editar" width="15px" height="15px">';
                editar.addEventListener("click", (e) => {

                    // Obtendo o ID do produto
                    idProduto = item.id;

                    // Executando a função de edição
                    updateProduto();
                });

                // Adicionando o botão de excluir
                const excluir = row.insertCell();
                excluir.innerHTML = '<img src="ícones/excluir.png" alt="Excluir" width="15px" height="15px">';
                excluir.addEventListener("click", (e) => {

                    // Obtendo o ID do produto
                    idProduto = item.id;

                    // Exibindo uma mensagem de confirmação
                    if (confirm("Deseja realmente excluir o produto?")) {

                        // Executando a função de exclusão
                        deleteProduto();
                    }
                });
            });
        } else {
            console.error("Os dados retornados não contém um array de produtos:", data);
        }
    } catch (error) {
        console.error(error);
    }
}


/*
  --------------------------------------------------------------------------------------
  Lista de valores permitidos para o dropdown
  --------------------------------------------------------------------------------------
*/
const produtosPermitidos = [
    "Cream Cheese",
    "Margarina Cremosa",
    "Manteiga com Sal",
    "Mortadela Ouro",
    "Patê de Peito de Peru",
    "Patê de Presunto",
    "Presunto Cozido",
    "Queijo Cheddar",
    "Queijo Prato",
    "Requeijão",
    "Salame Italiano"
];


/*
  --------------------------------------------------------------------------------------
  Função para preencher o dropdown com os valores da lista de produtos
  --------------------------------------------------------------------------------------
*/
function populateDropdown() {
    const dropdown = document.getElementById('dropdownNome');

    // Limpando o dropdown antes de adicionar novas opções
    dropdown.innerHTML = '<option value="" disabled selected>Selecione um produto</option>';

    // Preenchendo o dropdown com os produtos permitidos
    produtosPermitidos.forEach((produto) => {
        const option = document.createElement('option');
        option.value = produto;
        option.text = produto;
        dropdown.appendChild(option);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo produto
  -------------------------------------------------------------------------------------
*/
async function addProduto() {

    // Obtendo os dados do novo produto
    const nomeDropdown = document.getElementById("dropdownNome");
    const nome = nomeDropdown.value.toString();
    const quantidade = parseInt(document.getElementById("newQuantity").value, 10);
    const validadeInput = new Date(document.getElementById("newExpiration").value);
    const validade = new Date(validadeInput.getUTCFullYear(), validadeInput.getUTCMonth(), validadeInput.getUTCDate()).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    // Validando os dados
    if (isNaN(quantidade) || quantidade < 0) {
        alert("O campo 'Quantidade' deve ser preenchido com um nº inteiro e positivo.");
        return;
    }

    if (validade === "") {
        alert("O campo 'Validade' deve ser preenchido.");
        return;
    }

    try {
        await postItem(nome, quantidade, validade);
        alert("Produto adicionado com sucesso!");

        nomeDropdown.value = "";
        document.getElementById("newQuantity").value = "";
        document.getElementById("newExpiration").value = "";
        await location.reload();

    } catch (error) {
        console.error('Erro ao adicionar o produto:', error);
        alert('Erro ao adicionar o produto. Verifique o console para mais detalhes.');
    }
}


/*
  --------------------------------------------------------------------------------------
  Função para cancelar a adição de um produto
  --------------------------------------------------------------------------------------
*/
function cancelAddProduto() {
    const nomeDropdown = document.getElementById("dropdownNome");
    nomeDropdown.value = "";
    document.getElementById("newQuantity").value = "";
    document.getElementById("newExpiration").value = "";
    validateForm();
}


/*
  --------------------------------------------------------------------------------------
  Função para adicionar um produto na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (newInput, newQuantity, newExpiration) => {
    const formData = new FormData();
    formData.append('nome', newInput);
    formData.append('quantidade', newQuantity);
    formData.append('validade', newExpiration);

    try {
        const response = await fetch(urlAddProduto, {
            method: 'post',
            body: formData
        })

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Erro ao realizar a requisição POST: ', error)
        throw error;
    }
}


/*
  --------------------------------------------------------------------------------------
  Função para excluir um produto
  --------------------------------------------------------------------------------------
*/
async function deleteProduto() {
    try {
        // Executando a requisição DELETE
        const response = await fetch(urlDeleteProduto + "?id=" + idProduto, {
            method: "DELETE",
        });

        const data = await response.json();

        // Exibindo uma mensagem de confirmação
        alert("Produto excluído com sucesso!");
        location.reload();

    } catch (error) {
        console.error(error);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para atualizar um Produto
  --------------------------------------------------------------------------------------
*/
async function updateProduto() {

    // Executando a requisição GET
    const response = await fetch(urlConsultaProdutoPorId + "?id=" + idProduto, {
        method: "GET",
    });

    const produto = await response.json();

    // Recebendo os valores de quantidade e validade via prompt
    const newQuantityInput = prompt("Informe a nova quantidade do produto:", produto.quantidade);
    if (newQuantityInput === null) {
        return;
    }
    const newQuantity = parseInt(newQuantityInput, 10);
    // Convertendo a data de validade atual do produto para o formato brasileiro
    const validadeAtual = new Date(Date.parse(produto.validade));
    const validadeAtualUTC = new Date(validadeAtual.getUTCFullYear(), validadeAtual.getUTCMonth(), validadeAtual.getUTCDate());
    const validadeAtualBras = new Date(Date.parse(validadeAtualUTC)).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    let newExpirationInput = ''
    if (newQuantity !== null) {
        newExpirationInput = prompt("Informe a nova validade do produto (dd/mm/aaaa):", validadeAtualBras);
        if (newExpirationInput === null) {
            return;
        }
    }

    // Convertendo a nova data de validade para o formato brasileiro
    const newExpirationParts = newExpirationInput.split('/');
    const newExpiration = new Date(newExpirationParts[2], newExpirationParts[1] - 1, newExpirationParts[0]);
    const finalExpiration = new Date(newExpiration.getUTCFullYear(), newExpiration.getUTCMonth(), newExpiration.getUTCDate()).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    // Validando os dados
    if (isNaN(newQuantity) || newQuantity < 0) {
        alert("O campo 'Quantidade' deve ser preenchido com um número inteiro e positivo.");
        return;
    }

    if (newExpirationInput === "") {
        alert("O campo 'Validade' deve ser preenchido.");
        return;
    }

    // Atualizando os campos do produto
    produto.id = idProduto;
    produto.quantidade = newQuantity;
    produto.validade = finalExpiration;

    try {
        // Preparando a requisição PUT

        // Exibindo uma mensagem de confirmação
        if (confirm("Confirma a edição do produto?")) {
            // Executando a função atualização do item
            await UpdateItem(produto.id, produto.quantidade, produto.validade);
            await location.reload();
            alert("Produto atualizado com sucesso!");
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao atualizar o produto. Verifique o console para mais detalhes.");
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para editar um produto na lista do servidor via requisição PUT
  --------------------------------------------------------------------------------------
*/
const UpdateItem = async (idProduto, newQuantity, newExpiration) => {
    const formData = new FormData();
    formData.append('quantidade', newQuantity);
    formData.append('validade', newExpiration);

    try {
        const response = await fetch(urlUpdateProduto + "?id=" + idProduto, {
            method: 'PUT',
            body: formData,
        });

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Erro ao realizar a requisição PUT: ', error);
        throw error;
    }
}


/*
  --------------------------------------------------------------------------------------
  Função para obter a lista de produtos próximos ao vencimento
  --------------------------------------------------------------------------------------
*/
async function getAndSendProdutosProximosVencimento() {
    try {
        const response = await fetch(urlListaProdutos, { method: 'get' });
        const data = await response.json();

        //Verificando se a data.Lista de produtos é um array
        if (Array.isArray(data["Lista de produtos"])) {

            // Filtrando os produtos que vencem nos próximos 3 dias
            const dataAtual = new Date();
            const produtosProximosVencimento = data["Lista de produtos"].filter((item) => {
                const dataValidade = new Date(item.validade);
                const difEmDias = Math.floor((dataValidade - dataAtual) / (1000 * 60 * 60 * 24));
                return difEmDias <= 3;
            });

            // Ordenando a lista de produtos pela data de validade
            produtosProximosVencimento.sort((a, b) => {
                const dataValidadeA = new Date(Date.parse(a.validade));
                const dataValidadeB = new Date(Date.parse(b.validade));
                return dataValidadeA - dataValidadeB;
            });

            // Exibindo os produtos filtrados na tabela
            const table = document.getElementById("tabelaProdutosProximosVencimento");
            table.innerHTML = "";

            if (produtosProximosVencimento.length > 0) {
                produtosProximosVencimento.forEach((item) => {
                    const row = table.insertRow();
                    const nome = row.insertCell();
                    nome.textContent = item.nome;
                    const quantidade = row.insertCell();
                    quantidade.textContent = item.quantidade;
                    const validade = row.insertCell();

                    // Convertendo a string de validade para um objeto Date
                    const dataValidade = new Date(Date.parse(item.validade));

                    // Ajuste para garantir que a data seja tratada como UTC
                    const dataValidadeUTC = new Date(dataValidade.getUTCFullYear(), dataValidade.getUTCMonth(), dataValidade.getUTCDate());

                    // Verificando se a data é válida e transformando-a em string no formato brasileiro
                    if (isNaN(dataValidadeUTC)) {
                        validade.textContent = "Data Inválida";
                    } else {

                        // Formatando a data para o formato brasileiro sem a hora
                        validade.textContent = dataValidadeUTC.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        });
                    }
                });

            } else {
                const row = table.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 3;
                cell.textContent = "Não há itens a vencer nos próximos 3 dias!";
                cell.style.textAlign = 'center';
            }

            // Transformando a data de validade em string no formato brasileiro para envio pelo Telegram
            produtosProximosVencimento.forEach((item) => {
                const dataValidade = new Date(Date.parse(item.validade));
                const dataValidadeUTC = new Date(dataValidade.getUTCFullYear(), dataValidade.getUTCMonth(), dataValidade.getUTCDate());
                item.validade = dataValidadeUTC.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
            });

            // Enviando a mensagem pelo Telegram
            let message = '';
            if (produtosProximosVencimento.length > 0) {
                message = `Produtos a vencer:\n\n${produtosProximosVencimento.map((item) => `${item.nome} - ${item.quantidade} - ${item.validade}`).join('\n')}`;
                message = encodeURI(message);
                console.log('Mensagem:', message);
            } else {
                message = encodeURI('Não há itens a vencer nos próximos 3 dias!');
            }

            await envioTelegram(message);

        } else {
            console.error("Os dados retornados não contém um array de produtos:", data);
        }

    } catch (error) {
        console.error(error);
    }
}


/*
  --------------------------------------------------------------------------------------
  Função para enviar lista de próximos ao vencimento, pelo Telegram
  --------------------------------------------------------------------------------------
*/
async function envioTelegram(message) {

    // Definindo as variáveis de envio
    const botToken = "INSERIR O TOKEN DO BOT AQUI";
    const chatId = "INSERIR O SEU CHAT ID AQUI";

    // Montando a URL de envio
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${message}`;

    try {
        const response = await fetch(url, {
            method: 'get'
        });

        const data = await response.json();
        if (data.ok) {
            alert("Mensagem enviada com sucesso!");
        } else {
            alert("Erro ao enviar a mensagem. Verifique o console para mais detalhes.");
            console.error(data);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert("Erro ao enviar a mensagem. Verifique o console para mais detalhes.");
    }
}


/*
  --------------------------------------------------------------------------------------
  Executando a função de inicialização
  --------------------------------------------------------------------------------------
*/
window.onload = async () => {
    populateDropdown();
    getListaProdutos();
}