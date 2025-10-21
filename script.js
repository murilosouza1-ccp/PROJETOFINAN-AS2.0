/* ===========================
    VARIÁVEIS GERAIS
=========================== */
let salario = parseFloat(localStorage.getItem("salario")) || 1200.00;
let gastosVariaveis = JSON.parse(localStorage.getItem("gastosVariaveis")) || [];
let historico = JSON.parse(localStorage.getItem("historico")) || [];
let gastosFixos = JSON.parse(localStorage.getItem("gastosFixos")) || [
    { nome: "Banco do Brasil", valor: 0, logo: "https://logopng.com.br/logos/banco-do-brasil-5.png" },
    { nome: "Nubank", valor: 0, logo: "https://logodownload.org/wp-content/uploads/2019/08/nubank-logo-2.png" },
    { nome: "Banco Pan", valor: 0, logo: "https://melhorinvestimento.net/wp-content/uploads/2024/11/banco-pan-bpan4-768x768.jpg" },
    { nome: "Mercado Pago", valor: 0, logo: "https://images.seeklogo.com/logo-png/34/1/mercado-pago-logo-png_seeklogo-342347.png" },
    { nome: "Shopee Parcelado", valor: 0, logo: "https://static.cdnlogo.com/logos/s/2/shopee.png" }
];

/* ===========================
    ELEMENTOS
=========================== */
const salarioInput = document.getElementById("salarioInput");
const listaFixos = document.getElementById("listaFixos");
const listaVariaveis = document.getElementById("listaVariaveis");
const descVariavel = document.getElementById("descVariavel");
const valorVariavel = document.getElementById("valorVariavel");
const addVariavelBtn = document.getElementById("addVariavel");
const salvarMesBtn = document.getElementById("salvarMes");
const listaHistorico = document.getElementById("listaHistorico");
const metaEconomia = document.getElementById("metaEconomia");
const statusMeta = document.getElementById("statusMeta");
const graficoGastosBarrasCanvas = document.getElementById("graficoGastosBarras");
const graficoGastosGaugeCanvas = document.getElementById("graficoGastosGauge");
// REMOVIDO: const darkToggle = document.getElementById("darkModeToggle");

/* ===========================
    FUNÇÕES PARA O SALÁRIO
=========================== */
function formatarMoeda(valor) {
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico)) {
        return "R$: 0,00";
    }
    return `R$: ${valorNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function desformatarMoeda(texto) {
    if (typeof texto !== 'string') return 0;
    const valorLimpo = texto.replace('R$:', '').trim().replace(/\./g, '').replace(',', '.');
    const valorNumerico = parseFloat(valorLimpo);
    return isNaN(valorNumerico) ? 0 : valorNumerico;
}

function atualizarSalarioDisplay() {
    if (salarioInput) {
        salarioInput.value = formatarMoeda(salario);
    }
}

function formatarSalario() {
    if (salarioInput) {
        let valorDigitado = desformatarMoeda(salarioInput.value);
        if (valorDigitado < 0) {
            valorDigitado = 0;
        }
        salario = valorDigitado;
        salvarDados();
        atualizarSalarioDisplay();
        atualizarResumo();
    }
}

function handleSalarioEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        salarioInput.blur();
    }
}

/* ===========================
    NAVEGAÇÃO 
=========================== */
function navigate(viewId, element) {
    const views = document.querySelectorAll('.main-content .view');
    views.forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) targetView.classList.add('active');
    const navLinks = document.querySelectorAll('.sidebar-nav li');
    navLinks.forEach(link => link.classList.remove('active'));
    if (element && element.parentElement) element.parentElement.classList.add('active');
}

/* ===========================
    LOGIN / CADASTRO 
=========================== */
function alternarCadastro() {
    const nomeCadastroGroup = document.getElementById("nomeCadastroGroup");
    const fotoPerfilGroup = document.getElementById("fotoPerfilGroup");
    const titulo = document.getElementById("loginTitle");
    const authButton = document.getElementById('authButton');
    const loginMsg = document.getElementById("loginMsg");
    const registerLink = document.querySelector('.register-link p');
    if (!nomeCadastroGroup || !fotoPerfilGroup || !titulo || !authButton || !loginMsg || !registerLink) { console.error("Erro: Elementos do formulário de login/cadastro não encontrados."); return; }
    loginMsg.textContent = "";
    const modoCadastroAtivo = nomeCadastroGroup.style.display === "block";
    if (!modoCadastroAtivo) {
        nomeCadastroGroup.style.display = "block"; fotoPerfilGroup.style.display = "block";
        titulo.textContent = "CADASTRO"; authButton.textContent = "Inscreva-se";
        authButton.setAttribute('onclick', 'cadastrar()');
        registerLink.innerHTML = 'Já tem conta? <a href="#" onclick="alternarCadastro()">Faça login</a>';
    } else {
        nomeCadastroGroup.style.display = "none"; fotoPerfilGroup.style.display = "none";
        titulo.textContent = "LOGIN"; authButton.textContent = "Entrar";
        authButton.setAttribute('onclick', 'login()');
        registerLink.innerHTML = 'Não tem conta? <a href="#" onclick="alternarCadastro()">Inscreva-se</a>';
    }
}
function cadastrar() {
    const email = document.getElementById("email").value; const senha = document.getElementById("senha").value;
    const nome = document.getElementById("nomeCadastro").value; const foto = document.getElementById("fotoPerfil").files[0];
    const loginMsg = document.getElementById("loginMsg");
    if (!email || !senha || !nome) { loginMsg.textContent = "Preencha todos os campos!"; return; }
    const finalizarCadastro = (fotoBase64 = "") => {
        const usuario = { email, senha, nome, foto: fotoBase64 };
        localStorage.setItem("usuario", JSON.stringify(usuario));
        loginMsg.textContent = "Cadastro realizado! Faça login agora."; setTimeout(() => { alternarCadastro(); }, 1500);
    };
    if (foto) {
        if (typeof resizeImage === "function") { resizeImage(foto, 400, 400, 0.8).then(resizedImageData => finalizarCadastro(resizedImageData)).catch(err => finalizarCadastro()); }
        else { const reader = new FileReader(); reader.onload = (e) => finalizarCadastro(e.target.result); reader.readAsDataURL(foto); }
    } else { finalizarCadastro(); }
}
function login() {
    const email = document.getElementById("email").value; const senha = document.getElementById("senha").value;
    const loginMsg = document.getElementById("loginMsg"); const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.email !== email || usuario.senha !== senha) { loginMsg.textContent = "E-mail ou senha incorretos."; return; }
    document.getElementById("loginContainer").style.display = "none"; document.getElementById("app").style.display = "flex";
    document.getElementById("nomeUsuario").textContent = usuario.nome;
    document.getElementById("fotoUsuario").src = usuario.foto || "https://cdn-icons-png.flaticon.com/512/1077/1077012.png";
    salario = parseFloat(localStorage.getItem("salario")) || 1200.00;
    // REMOVIDO: carregarTema(); 
    renderTudo();
    const inicioLink = document.querySelector('.sidebar-nav li a[onclick*="inicio"]');
    if (inicioLink) { navigate('inicio', inicioLink); } else { console.error("Link 'inicio' não encontrado."); }
}
function logout() { document.getElementById("app").style.display = "none"; document.getElementById("loginContainer").style.display = "flex"; }

/* ===========================
    FUNÇÕES PRINCIPAIS 
=========================== */
function salvarDados() {
    localStorage.setItem("salario", salario.toString());
    localStorage.setItem("gastosFixos", JSON.stringify(gastosFixos));
    localStorage.setItem("gastosVariaveis", JSON.stringify(gastosVariaveis));
    localStorage.setItem("historico", JSON.stringify(historico));
}
function renderFixos() { if (!listaFixos) return; listaFixos.innerHTML = ""; gastosFixos.forEach((gasto, i) => { const div = document.createElement("div"); div.classList.add("gasto-item"); div.innerHTML = `<div class="gasto-item-info"><img src="${gasto.logo || 'ICON_PLACEHOLDER.png'}" alt="${gasto.nome}"><span>${gasto.nome}</span></div><span class="gasto-valor">R$ ${gasto.valor.toFixed(2)}</span><button class="btn-excluir" onclick="excluirFixo(${i})">X</button>`; listaFixos.appendChild(div); }); }
function excluirFixo(i) { gastosFixos.splice(i, 1); renderFixos(); atualizarResumo(); salvarDados(); }
function renderVariaveis() { if (!listaVariaveis) return; listaVariaveis.innerHTML = ""; gastosVariaveis.forEach((gasto, i) => { const div = document.createElement("div"); div.classList.add("gasto-item"); div.innerHTML = `<div class="gasto-item-info"><span>${gasto.desc}</span></div><span class="gasto-valor">R$ ${gasto.valor.toFixed(2)}</span><button class="btn-excluir" onclick="excluirVariavel(${i})">X</button>`; listaVariaveis.appendChild(div); }); }
function renderHistorico() { if (!listaHistorico) return; listaHistorico.innerHTML = ""; historico.forEach((mes, i) => { const li = document.createElement("li"); li.classList.add("historico-item"); li.innerHTML = `<span>${mes.mesAno}</span><div><button onclick="carregarMes(${i})">Carregar</button><button class="btn-excluir" onclick="excluirMes(${i})">Excluir</button></div>`; listaHistorico.appendChild(li); }); }

function atualizarResumo() {
    const totalFixosEl = document.getElementById("totalFixos");
    const totalVariaveisEl = document.getElementById("totalVariaveis");
    const saldoAtualEl = document.getElementById("saldoAtual");
    const totalFixos = gastosFixos.reduce((acc, g) => acc + (g.valor || 0), 0);
    const totalVariaveisTotal = gastosVariaveis.reduce((acc, g) => acc + (g.valor || 0), 0);
    const salarioNumerico = parseFloat(salario) || 0;
    const saldo = salarioNumerico - totalFixos - totalVariaveisTotal;
    if (totalFixosEl) { totalFixosEl.textContent = `R$ ${totalFixos.toFixed(2)}`; } else { console.error("ERRO: Elemento 'totalFixos' não encontrado!"); }
    if (totalVariaveisEl) { totalVariaveisEl.textContent = `R$ ${totalVariaveisTotal.toFixed(2)}`; } else { console.error("ERRO: Elemento 'totalVariaveis' não encontrado!"); }
    if (saldoAtualEl) { saldoAtualEl.textContent = `R$ ${saldo.toFixed(2)}`; saldoAtualEl.classList.toggle("saldo-positivo", saldo >= 0); saldoAtualEl.classList.toggle("saldo-negativo", saldo < 0); } else { console.error("ERRO: Elemento 'saldoAtual' não encontrado!"); }
    if (metaEconomia && metaEconomia.value) { const meta = parseFloat(metaEconomia.value); if (statusMeta) statusMeta.textContent = saldo >= meta ? "🎯 Meta atingida!" : "💸 Meta não alcançada."; }
    gerarGraficos(totalFixos, totalVariaveisTotal);
}

/* ===========================
    ADICIONAR / EXCLUIR 
=========================== */
if (addVariavelBtn) { addVariavelBtn.addEventListener("click", () => { if (!descVariavel || !valorVariavel) return; const desc = descVariavel.value.trim(); const valor = parseFloat(valorVariavel.value); if (!desc || !valor || valor <= 0) return; gastosVariaveis.push({ desc, valor }); descVariavel.value = ""; valorVariavel.value = ""; renderVariaveis(); atualizarResumo(); salvarDados(); }); }
function excluirVariavel(i) { gastosVariaveis.splice(i, 1); renderVariaveis(); atualizarResumo(); salvarDados(); }
const addFixoBtn = document.getElementById("addFixo");
if (addFixoBtn) { addFixoBtn.addEventListener("click", () => { const nomeEl = document.getElementById("nomeFixo"); const valorEl = document.getElementById("valorFixo"); const logoEl = document.getElementById("logoFixo"); if (!nomeEl || !valorEl || !logoEl) return; const nome = nomeEl.value.trim(); const valor = parseFloat(valorEl.value); const logo = logoEl.value.trim(); if (!nome || isNaN(valor)) return; gastosFixos.push({ nome, valor, logo: logo || "https://cdn-icons-png.flaticon.com/512/2331/2331941.png" }); nomeEl.value = ""; valorEl.value = ""; logoEl.value = ""; renderFixos(); atualizarResumo(); salvarDados(); }); }

/* ===========================
    SALVAR, CARREGAR, EXCLUIR 
=========================== */
if (salvarMesBtn) { salvarMesBtn.addEventListener("click", () => { const data = new Date(); const mesAno = `${data.toLocaleString("pt-BR", { month: "long" })} ${data.getFullYear()}`; historico.push({ mesAno, salario, gastosFixos: JSON.parse(JSON.stringify(gastosFixos)), gastosVariaveis: JSON.parse(JSON.stringify(gastosVariaveis)), }); salvarDados(); renderHistorico(); }); }
function carregarMes(i) {
    if (!historico[i]) return;
    const mes = historico[i];
    salario = mes.salario;
    gastosFixos = mes.gastosFixos;
    gastosVariaveis = mes.gastosVariaveis;
    atualizarSalarioDisplay();
    renderTudo();
    salvarDados();
    const inicioLink = document.querySelector('.sidebar-nav li a[onclick*="inicio"]');
    if (inicioLink) navigate('inicio', inicioLink);
}
function excluirMes(i) { historico.splice(i, 1); salvarDados(); renderHistorico(); }

/* ===========================
    GERAÇÃO DE GRÁFICOS
=========================== */
let graficoBarras;
let graficoGauge;
function gerarGraficos(fixos, variaveis) {
    if (graficoBarras) { try { graficoBarras.destroy(); } catch (e) { console.error("Erro destroy Barras:", e); } }
    if (graficoGauge) { try { graficoGauge.destroy(); } catch (e) { console.error("Erro destroy Gauge:", e); } }
    const totalFixos = isNaN(fixos) ? 0 : fixos;
    const totalVariaveis = isNaN(variaveis) ? 0 : variaveis;
    const totalGastos = totalFixos + totalVariaveis;
    const salarioNumerico = parseFloat(salario) || 0;
    const percentualGastoSalario = salarioNumerico > 0 ? Math.min(((totalGastos / salarioNumerico) * 100), 100) : 0;
    const percentualRestante = 100 - percentualGastoSalario;

    // Simplificado: Cores sempre do modo claro
    const corTexto = 'rgba(0, 0, 0, 0.7)';
    const corBorda = 'var(--card-light)'; // Fundo do card claro
    const corGaugeRestante = '#E5E7EB'; // Cor cinza claro para gauge

    const canvasBarras = document.getElementById("graficoGastosBarras");
    const canvasGauge = document.getElementById("graficoGastosGauge");
    const gaugePercentualEl = document.getElementById("gaugePercentual");
    const gaugeAvisoEl = document.querySelector(".gauge-aviso");
    if (canvasBarras) {
        try {
            const ctxBarras = canvasBarras.getContext('2d');
            graficoBarras = new Chart(ctxBarras, {
                type: 'bar', data: { labels: ['Fixos', 'Variáveis'], datasets: [{ label: 'Valor Gasto (R$)', data: [totalFixos, totalVariaveis], backgroundColor: ['#1E3A8A', '#3B82F6'], borderColor: corBorda, borderWidth: 1 }] },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, ticks: { color: corTexto } }, y: { ticks: { color: corTexto } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (context) { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.x !== null) { label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.x); } return label; } } } } }
            });
        } catch (e) { console.error("Erro Barras:", e); }
    } else { console.warn("Canvas Barras não encontrado."); }
    if (canvasGauge && gaugePercentualEl) {
        try {
            const ctxGauge = canvasGauge.getContext('2d');
            graficoGauge = new Chart(ctxGauge, {
                type: 'doughnut', data: { labels: ['Gasto', 'Restante'], datasets: [{ data: [percentualGastoSalario, percentualRestante], backgroundColor: ['#FB923C', corGaugeRestante], borderColor: corBorda, borderWidth: 2, circumference: 180, rotation: 270, }] },
                options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
            });
            gaugePercentualEl.textContent = `${percentualGastoSalario.toFixed(0)}%`;
            if (gaugeAvisoEl) { gaugeAvisoEl.style.display = percentualGastoSalario > 80 ? 'block' : 'none'; }
        } catch (e) { console.error("Erro Gauge:", e); }
    } else { console.warn("Canvas Gauge ou Percentual não encontrado."); }
}

/* ===========================
    MODO ESCURO / CLARO (REMOVIDO)
=========================== */
// REMOVIDO: Listener do darkToggle
// REMOVIDO: Função carregarTema()

/* ===========================
    MODAL DE PERFIL 
=========================== */
function abrirModalPerfil() { const modal = document.getElementById("profileModal"); const usuario = JSON.parse(localStorage.getItem("usuario")); if (!usuario || !modal) return; document.getElementById("nomeUsuarioModal").value = usuario.nome; document.getElementById("emailUsuarioModal").value = usuario.email; document.getElementById("senhaAtualModal").value = ""; document.getElementById("novaSenhaModal").value = ""; document.getElementById("profileMsg").textContent = ""; modal.style.display = "flex"; }
function fecharModalPerfil() { const modal = document.getElementById("profileModal"); if (modal) modal.style.display = "none"; }
window.onclick = function (event) { const modal = document.getElementById("profileModal"); if (event.target == modal) { fecharModalPerfil(); } }
const saveProfileBtn = document.getElementById("saveProfileBtn");
// Corrigido: Adicionado listener aqui se não estiver no HTML
if (saveProfileBtn && !saveProfileBtn.getAttribute('onclick')) {
    saveProfileBtn.addEventListener("click", salvarPerfil);
}
async function salvarPerfil() { const profileMsg = document.getElementById("profileMsg"); let usuario = JSON.parse(localStorage.getItem("usuario")); const nome = document.getElementById("nomeUsuarioModal").value.trim(); const email = document.getElementById("emailUsuarioModal").value.trim(); const senhaAtual = document.getElementById("senhaAtualModal").value; const novaSenha = document.getElementById("novaSenhaModal").value; const novaFotoFile = document.getElementById("fotoPerfilModal").files[0]; if (!nome || !email || !senhaAtual) { profileMsg.textContent = "Campos obrigatórios!"; return; } if (senhaAtual !== usuario.senha) { profileMsg.textContent = "Senha atual incorreta!"; return; } usuario.nome = nome; usuario.email = email; if (novaSenha) { usuario.senha = novaSenha; } const atualizarTudo = (usuarioAtualizado) => { localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado)); document.getElementById("nomeUsuario").textContent = usuarioAtualizado.nome; document.getElementById("fotoUsuario").src = usuarioAtualizado.foto || "https://cdn-icons-png.flaticon.com/512/1077/1077012.png"; profileMsg.textContent = "Atualizado!"; setTimeout(fecharModalPerfil, 1500); }; if (novaFotoFile) { try { if (typeof resizeImage === "function") { const resizedImageData = await resizeImage(novaFotoFile, 400, 400, 0.8); usuario.foto = resizedImageData; atualizarTudo(usuario); } else { const reader = new FileReader(); reader.onload = (e) => { usuario.foto = e.target.result; atualizarTudo(usuario); }; reader.readAsDataURL(novaFotoFile); } } catch (error) { profileMsg.textContent = "Erro imagem."; } } else { atualizarTudo(usuario); } }

/* ===========================
    FUNÇÃO DE REDIMENSIONAR IMAGEM 
=========================== */
function resizeImage(file, maxWidth, maxHeight, quality) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = (event) => { const img = new Image(); img.src = event.target.result; img.onload = () => { const canvas = document.createElement('canvas'); let width = img.width; let height = img.height; if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } } else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } } canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', quality)); }; img.onerror = reject; }; reader.onerror = reject; }); }

/* ===========================
    INICIALIZAÇÃO 
=========================== */
function renderTudo() {
    if (listaFixos) renderFixos();
    if (listaVariaveis) renderVariaveis();
    if (listaHistorico) renderHistorico();
    atualizarSalarioDisplay();
    atualizarResumo(); // Isso já chama gerarGraficos
}

document.addEventListener('DOMContentLoaded', () => {
    // REMOVIDO: carregarTema(); 

    const appContainer = document.getElementById('app');
    const loginContainer = document.getElementById('loginContainer');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (usuario && appContainer) {
        if (loginContainer) loginContainer.style.display = "none";
        appContainer.style.display = "flex";

        const nomeUsuarioEl = document.getElementById("nomeUsuario");
        const fotoUsuarioEl = document.getElementById("fotoUsuario");
        if (nomeUsuarioEl) nomeUsuarioEl.textContent = usuario.nome;
        if (fotoUsuarioEl) fotoUsuarioEl.src = usuario.foto || "https://cdn-icons-png.flaticon.com/512/1077/1077012.png";

        salario = parseFloat(localStorage.getItem("salario")) || 1200.00;
        gastosFixos = JSON.parse(localStorage.getItem("gastosFixos")) || [];
        gastosVariaveis = JSON.parse(localStorage.getItem("gastosVariaveis")) || [];
        historico = JSON.parse(localStorage.getItem("historico")) || [];

        renderTudo();

        const inicioLink = document.querySelector('.sidebar-nav li a[onclick*="inicio"]');
        if (inicioLink) navigate('inicio', inicioLink);

    } else if (loginContainer) {
        loginContainer.style.display = "flex";
        if (appContainer) appContainer.style.display = "none";
    } else {
        console.error("ERRO: Container de login ou app não encontrado!");
    }
});

function abrirResetSenha() { const el = document.getElementById("resetContainer"); if (el) el.style.display = "flex"; }
function fecharResetSenha() { const el = document.getElementById("resetContainer"); if (el) el.style.display = "none"; }
function verificarEmail() { const email = document.getElementById("resetEmail").value; const usuario = JSON.parse(localStorage.getItem("usuario")); const msg = document.getElementById("resetMsg"); if (!usuario || usuario.email !== email) { msg.textContent = "E-mail não encontrado!"; return; } msg.textContent = "Confirmado. Nova senha."; document.getElementById("novaSenha").style.display = "block"; document.getElementById("salvarNovaSenhaBtn").style.display = "block"; document.getElementById("verificarEmailBtn").style.display = "none"; }
function salvarNovaSenha() { const novaSenha = document.getElementById("novaSenha").value; const email = document.getElementById("resetEmail").value; const usuario = JSON.parse(localStorage.getItem("usuario")); const msg = document.getElementById("resetMsg"); if (!novaSenha) { msg.textContent = "Digite a nova senha!"; return; } if (usuario && usuario.email === email) { usuario.senha = novaSenha; localStorage.setItem("usuario", JSON.stringify(usuario)); msg.textContent = "Senha alterada!"; setTimeout(() => fecharResetSenha(), 1500); } }
/* ===========================
    TOGGLE SIDEBAR MOBILE
=========================== */
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('active'); // Adiciona ou remove a classe 'active'
  } else {
    console.error("Elemento .sidebar não encontrado!");
  }
}

// Opcional: Fechar sidebar ao clicar fora dela (em telas pequenas)
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.querySelector('.menu-toggle-button');

    // Verifica se a sidebar existe, está ativa E se o clique foi fora dela E fora do botão de toggle
    if (sidebar && sidebar.classList.contains('active') && 
        !sidebar.contains(event.target) && 
        !toggleButton.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});