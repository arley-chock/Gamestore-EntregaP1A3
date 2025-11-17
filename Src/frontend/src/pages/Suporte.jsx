import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../utils/api';

const Suporte = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Função para carregar o perfil do usuário
  const loadUserProfile = useCallback(async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('Você precisa estar logado para acessar esta página.');
      navigate('/');
      return false;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/perfil`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!resp.ok) {
        console.warn('Token inválido ou sessão expirada.');
        localStorage.removeItem('authToken');
        navigate('/');
        return false;
      }

      const user = await resp.json();
      setCurrentUser(user);
      return true;
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      navigate('/');
      return false;
    }
  }, [navigate]);

  // Função para carregar os chamados do usuário logado
  const carregarMeusChamados = useCallback(() => {
    if (!currentUser) return;

    const todosChamados = JSON.parse(localStorage.getItem('chamados')) || [];

    const userEmails = currentUser.email ? [String(currentUser.email).toLowerCase()] : [];
    const userIds = [];
    if (currentUser.id) userIds.push(String(currentUser.id));
    if (currentUser.usuarioId) userIds.push(String(currentUser.usuarioId));
    const userName = currentUser.nome ? String(currentUser.nome).toLowerCase() : null;

    // Filtra chamados do usuário logado
    const meusChamadosFiltrados = todosChamados.filter((chamado) => {
      if (chamado.email && userEmails.includes(String(chamado.email).toLowerCase())) return true;
      const cid = String(chamado.usuarioId || chamado.userId || chamado.idUsuario || '');
      if (cid && userIds.includes(cid)) return true;
      if (chamado.nome && userName && String(chamado.nome).toLowerCase() === userName) return true;
      return false;
    });

    setChamados(meusChamadosFiltrados);
  }, [currentUser]);

  // Efeito para carregar o perfil na montagem do componente
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const perfilOk = await loadUserProfile();
      if (!perfilOk) {
        setError('Não foi possível carregar o histórico (verifique login).');
      }
      setLoading(false);
    };
    init();
  }, [loadUserProfile]);

  // Efeito para carregar chamados quando o usuário for carregado
  useEffect(() => {
    if (currentUser) {
      carregarMeusChamados();
    }
  }, [currentUser, carregarMeusChamados]);

  // Função para lidar com o envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Você precisa estar logado para enviar um chamado.');
      return;
    }

    if (!assunto.trim() || !mensagem.trim()) {
      alert('Preencha todos os campos antes de enviar.');
      return;
    }

    const novoChamado = {
      usuarioId: currentUser.id || currentUser.usuarioId || null,
      nome: currentUser.nome || '',
      email: currentUser.email || '',
      assunto,
      mensagem,
      data: new Date().toLocaleString('pt-BR'),
    };

    const todosChamados = JSON.parse(localStorage.getItem('chamados')) || [];
    todosChamados.push(novoChamado);
    localStorage.setItem('chamados', JSON.stringify(todosChamados));

    alert('Chamado enviado com sucesso!');
    setAssunto('');
    setMensagem('');
    carregarMeusChamados(); // Atualiza a lista de chamados na interface
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Carregando perfil e histórico...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="suporte-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button className="breadcrumb-btn">INÍCIO &gt; SUPORTE</button>
      </div>

      <div className="suporte-container">
        <div className="suporte-header">
          <h1>Central de Suporte</h1>
          <p>Como podemos ajudá-lo hoje?</p>
        </div>

        {/* Formulário de Chamado */}
        <div className="suporte-form-section">
          <h2>Abrir Novo Chamado</h2>
          <form className="suporte-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                value={currentUser?.nome || ''}
                readOnly
                className="form-input readonly"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={currentUser?.email || ''}
                readOnly
                className="form-input readonly"
              />
            </div>

            <div className="form-group">
              <label htmlFor="assunto">Assunto:</label>
              <input
                type="text"
                id="assunto"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                className="form-input"
                placeholder="Digite o assunto do seu chamado"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mensagem">Mensagem:</label>
              <textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="form-textarea"
                placeholder="Descreva detalhadamente o seu problema ou dúvida..."
                rows="6"
                required
              />
            </div>

            <button type="submit" className="btn-submit">
              Enviar Chamado
            </button>
          </form>
        </div>

        {/* Histórico de Chamados */}
        <div className="suporte-history-section">
          <h2>Histórico de Chamados</h2>
          {chamados.length === 0 ? (
            <div className="no-chamados">
              <p>Nenhum chamado enviado ainda.</p>
              <p>Use o formulário acima para abrir seu primeiro chamado.</p>
            </div>
          ) : (
            <div className="chamados-list">
              {chamados.map((chamado, index) => (
                <div key={index} className="chamado-card">
                  <div className="chamado-header">
                    <h3>{chamado.assunto || '(sem assunto)'}</h3>
                    <span className="chamado-date">
                      Enviado em {chamado.data || '(sem data)'}
                    </span>
                  </div>
                  <div className="chamado-body">
                    <p>{chamado.mensagem}</p>
                  </div>
                  <div className="chamado-footer">
                    <span className="chamado-status">Pendente</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Perguntas Frequentes</h2>
          <div className="faq-items">
            <div className="faq-item">
              <h3>Como recebo minhas chaves de ativação?</h3>
              <p>As chaves de ativação são enviadas automaticamente para seu email após a confirmação do pagamento. Você também pode encontrá-las na seção "Biblioteca" do seu perfil.</p>
            </div>
            <div className="faq-item">
              <h3>Como solicitar reembolso?</h3>
              <p>Reembolsos podem ser solicitados em até 7 dias após a compra. Entre em contato através deste formulário ou email: suporte@gamestore.com.br</p>
            </div>
            <div className="faq-item">
              <h3>Os jogos têm garantia?</h3>
              <p>Sim! Todos os jogos têm garantia de funcionamento. Em caso de problemas técnicos, nossa equipe está disponível para ajudar.</p>
            </div>
            <div className="faq-item">
              <h3>Como cancelar uma compra?</h3>
              <p>Compras podem ser canceladas em até 24 horas após a confirmação. Entre em contato conosco com os detalhes da transação.</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="contact-info">
          <h2>Outras formas de contato</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <h3>Email</h3>
              <p>suporte@gamestore.com.br</p>
            </div>
            <div className="contact-method">
              <h3>Horário de Atendimento</h3>
              <p>Segunda a Sexta: 9h às 18h<br />Sábado: 9h às 14h</p>
            </div>
            <div className="contact-method">
              <h3>Tempo de Resposta</h3>
              <p>Em até 24 horas úteis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suporte;