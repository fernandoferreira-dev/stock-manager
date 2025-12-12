// src/components/tableges.jsx
import React, { Fragment, useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, AlertCircle, Wifi, WifiOff } from "lucide-react";
import "../styles/admintb.css";

export default function InventoryTable() {
  const [inventory, setInventory] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showRFIDModal, setShowRFIDModal] = useState(false);
  const [selectedArtigoId, setSelectedArtigoId] = useState(null);
  const [rfidStatus, setRfidStatus] = useState('idle');
  const [rfidMessage, setRfidMessage] = useState('');
  const [readUID, setReadUID] = useState('');
  const [rfidByArtigo, setRfidByArtigo] = useState({});
  const [rfidLoading, setRfidLoading] = useState({});
  const [rfidError, setRfidError] = useState({});
  const [categoriesList, setCategoriesList] = useState([]);
  const [labsList, setLabsList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ nome: '', id_subcat: '', id_lab: '', quantidade: 1 });
  const [adding, setAdding] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editArticle, setEditArticle] = useState({ id_artigo: null, nome: '', id_subcat: '', id_lab: '', quantidade: 0 });
  const [editing, setEditing] = useState(false);
  const getAPIURL = () => {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const port = host === 'localhost' || host === '127.0.0.1' ? ':8000' : '';
    return `${protocol}//${host}${port}/api`;
  };

  const API_URL = getAPIURL();

  useEffect(() => {
    fetchInventory();

  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [artigos, labs, categorias] = await Promise.all([
        fetch(`${API_URL}/artigo.php`).then(r => r.json()),
        fetch(`${API_URL}/labs.php`).then(r => r.json()),
        fetch(`${API_URL}/categorias.php?com_subcategorias=true`).then(r => r.json())
      ]);

      const mappedInventory = await Promise.all(artigos.map(async (a) => {
        const lab = labs.find(l => l.id_lab === a.id_lab);
        const cat = categorias.find(c => c.id_cat === a.id_cat);
        let disponiveis = 0;
        let total = 0;
        try {
          const cartoesResp = await fetch(`${API_URL}/rfid.php?artigo=${a.id_artigo}`);
          const cartoes = await cartoesResp.json();
          if (Array.isArray(cartoes)) {
            total = cartoes.length;
            disponiveis = cartoes.filter(c => c.estado === 'disponivel').length;
          }
        } catch (err) {
          console.error('Erro ao buscar cartÃµes:', err);
        }

        return {
          id: a.id_artigo,
          name: a.nome_artigo,
          category: cat ? cat.nome_cat : "â€”",
          lab: lab ? `Lab ${lab.num_lab}` : "â€”",
          quantity: a.quantidade || 0,
          disponiveis,
          total
        };
      }));

      setInventory(mappedInventory);
      setCategoriesList(categorias || []);
      setLabsList(labs || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Erro desconhecido");
      console.error("Erro ao buscar inventÃ¡rio:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = async (artigoId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(artigoId)) {
      newExpanded.delete(artigoId);
      setExpandedRows(newExpanded);
      return;
    }

    newExpanded.add(artigoId);
    setExpandedRows(newExpanded);
    loadAssociatedCards(artigoId);
  };

  const loadAssociatedCards = async (artigoId) => {
    setRfidLoading(prev => ({ ...prev, [artigoId]: true }));
    setRfidError(prev => ({ ...prev, [artigoId]: '' }));
    try {
      const res = await fetch(`${API_URL}/rfid.php?artigo=${artigoId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRfidByArtigo(prev => ({ ...prev, [artigoId]: data }));
      } else {
        setRfidError(prev => ({ ...prev, [artigoId]: 'NÃ£o foi possÃ­vel carregar os cartÃµes deste artigo.' }));
      }
    } catch (err) {
      setRfidError(prev => ({ ...prev, [artigoId]: err.message }));
    } finally {
      setRfidLoading(prev => ({ ...prev, [artigoId]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Tem certeza que deseja eliminar o item ${id}?`)) return;

    try {
      const deleteUrl = `${API_URL}/artigo.php?id=${id}`;
      console.debug('Removendo artigo, URL:', deleteUrl);
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "Falha ao eliminar item");
      }

      setInventory(prev => prev.filter(i => i.id !== id));
      alert("Item eliminado com sucesso!");
    } catch (err) {
      alert(`Erro ao eliminar: ${err.message}`);
    }
  };

  const openEditModal = async (id) => {
    setShowEditModal(true);
    setEditing(false);
    try {
      const res = await fetch(`${API_URL}/artigo.php?id=${id}`);
      const data = await res.json();
      const artigo = Array.isArray(data) && data.length > 0 ? data[0] : data;
      setEditArticle({
        id_artigo: artigo.id_artigo || artigo.id || id,
        nome: artigo.nome_artigo || artigo.nome || '',
        id_cat: artigo.id_cat || '',
        id_subcat: artigo.id_subcat || artigo.id_subcat || '',
        id_lab: artigo.id_lab || artigo.id_laboratorio || '',
        quantidade: artigo.quantidade || 0,
      });
    } catch (err) {
      alert(`Erro ao carregar artigo para ediÃ§Ã£o: ${err.message}`);
      setShowEditModal(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditArticle({ id_artigo: null, nome: '', id_cat: '', id_subcat: '', id_lab: '', quantidade: 0 });
    setEditing(false);
  };

  const updateArticle = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editArticle.nome || editArticle.nome.trim() === '') {
      alert('O nome do artigo Ã© obrigatÃ³rio.');
      return;
    }

    setEditing(true);
    try {
      const response = await fetch(`${API_URL}/artigo.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_artigo: editArticle.id_artigo,
          nome_artigo: editArticle.nome,
          id_cat: editArticle.id_cat || null,
          id_subcat: editArticle.id_subcat || null,
          id_lab: editArticle.id_lab || null,
          quantidade: Number(editArticle.quantidade) || 0,
        })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && (data.message || true)) {
        alert('Artigo atualizado com sucesso.');
        closeEditModal();
        fetchInventory();
      } else {
        throw new Error(data.message || 'Falha ao atualizar artigo');
      }
    } catch (err) {
      alert(`Erro ao atualizar artigo: ${err.message}`);
    } finally {
      setEditing(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(inventory.length / itemsPerPage));

  const startAssociation = (id_artigo) => {
    setSelectedArtigoId(id_artigo);
    setShowRFIDModal(true);
    setRfidStatus('idle');
    setRfidMessage('');
    setReadUID('');
  };

  const closeRFIDModal = () => {
    setShowRFIDModal(false);
    setSelectedArtigoId(null);
    setRfidStatus('idle');
    setRfidMessage('');
    setReadUID('');
  };
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewArticle({ nome: '', id_subcat: '', id_lab: '', quantidade: 1 });
    setAdding(false);
  };

  const createArticle = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newArticle.nome || newArticle.nome.trim() === '') {
      alert('O nome do artigo Ã© obrigatÃ³rio.');
      return;
    }

    setAdding(true);
    try {
      const response = await fetch(`${API_URL}/artigo.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome_artigo: newArticle.nome,
          id_subcat: newArticle.id_subcat || null,
          id_lab: newArticle.id_lab || null,
          quantidade: Number(newArticle.quantidade) || 0,
        })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok || data.success) {
        alert('Artigo criado com sucesso.');
        closeAddModal();
        fetchInventory();
      } else {
        throw new Error(data.message || 'Falha ao criar artigo');
      }
    } catch (err) {
      alert(`Erro ao criar artigo: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  const readRFIDCard = async () => {
    setRfidStatus('reading');
    setRfidMessage('Ã espera do cartÃ£o... Aproxime o cartÃ£o do leitor.');

    try {
      const response = await fetch(`${API_URL}/read_rfid.php?timeout=30`);
      const data = await response.json();

      if (data.success && data.uid) {
        setReadUID(data.uid);
        setRfidStatus('success');
        setRfidMessage(`CartÃ£o lido: ${data.uid}`);
        await associateCard(data.uid, selectedArtigoId);
      } else {
        setRfidStatus('error');
        setRfidMessage(data.message || 'Nenhum cartÃ£o detectado. Tente novamente.');
      }
    } catch (err) {
      setRfidStatus('error');
      setRfidMessage(`Erro: ${err.message}. Verifique se o bridge estÃ¡ rodando.`);
    }
  };

  const associateCard = async (uid, artigoId) => {
    try {
      const response = await fetch(`${API_URL}/rfid.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          id_artigo: artigoId
        })
      });

      const data = await response.json();

      if (data.success) {
        setRfidStatus('success');
        setRfidMessage(`CartÃ£o ${uid} associado com sucesso ao artigo!`);
        loadAssociatedCards(artigoId);
        setTimeout(() => {
          closeRFIDModal();
        }, 2000);
      } else {
        setRfidStatus('error');
        setRfidMessage(data.message || 'Erro ao associar cartÃ£o');
      }
    } catch (err) {
      setRfidStatus('error');
      setRfidMessage(`Erro ao associar: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Carregando inventÃ¡rio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">
          <div className="error-header">
            <AlertCircle size={24} />
            <h3>Erro ao carregar dados</h3>
          </div>
          <p className="error-message">{error}</p>
          <button onClick={fetchInventory} className="retry-button">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1 className="inventory-title">GestÃ£o de InventÃ¡rio</h1>
        <p className="inventory-subtitle">{inventory.length} artigos no sistema</p>
      </div>

      <div className="add-button-container">
        <button onClick={() => setShowAddModal(true)} className="add-button">
          <Plus size={20} /> Adicionar Artigo
        </button>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th className="col-expand"></th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>LaboratÃ³rio</th>
                <th>Quantidade</th>
                <th className="col-actions">AÃ§Ãµes</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map(item => (
                <Fragment key={item.id}>

                  {}
                  <tr className="table-row">
                    <td>
                      <button
                        onClick={() => toggleRow(item.id)}
                        className="expand-button"
                        title="OpÃ§Ãµes do artigo"
                      >
                        {expandedRows.has(item.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </td>
                    <td><div className="item-name">{item.name}</div></td>
                    <td className="category-text">{item.category}</td>
                    <td className="lab-text">{item.lab}</td>
                    <td>
                      <span className={`quantity ${
                        item.disponiveis === 0 ? 'zero' : item.disponiveis < 3 ? 'low' : 'normal'
                      }`}>
                        {item.disponiveis}/{item.total}
                      </span>
                    </td>
                    <td>
                      <div className="actions-container">
                        <button onClick={() => openEditModal(item.id)} className="action-button edit" title="Editar">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="action-button delete" title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {}
                  {expandedRows.has(item.id) && (
                    <tr className="expanded-row">
                      <td colSpan="6">
                        <div className="expanded-content">
                          <h4 className="assoc-title">CartÃµes NFC Associados</h4>
                          <p className="assoc-description">CartÃµes associados a este artigo e seus estados atuais.</p>

                          <div className="associated-cards">
                            {rfidLoading[item.id] && <p className="small-text">Carregando cartÃµes...</p>}
                            {rfidError[item.id] && <p className="error-text">{rfidError[item.id]}</p>}
                            {Array.isArray(rfidByArtigo[item.id]) && rfidByArtigo[item.id].length === 0 && (
                              <div className="no-cards-message">
                                <WifiOff size={32} style={{opacity: 0.3}} />
                                <p className="small-text">Nenhum cartÃ£o NFC associado a este artigo.</p>
                              </div>
                            )}
                            {Array.isArray(rfidByArtigo[item.id]) && rfidByArtigo[item.id].length > 0 && (
                              <div className="cards-grid">
                                {rfidByArtigo[item.id].map(card => {
                                  const statusClass = 
                                    card.estado === 'disponivel' ? 'status-disponivel' :
                                    card.estado === 'reservado' ? 'status-reservado' :
                                    card.estado === 'em_uso' ? 'status-em-uso' :
                                    card.estado === 'devolvido' ? 'status-devolvido' : 'status-default';

                                  const statusLabel = 
                                    card.estado === 'disponivel' ? 'DisponÃ­vel' :
                                    card.estado === 'reservado' ? 'Reservado' :
                                    card.estado === 'em_uso' ? 'Em Uso' :
                                    card.estado === 'devolvido' ? 'Devolvido' : card.estado || 'Desconhecido';

                                  return (
                                    <div key={card.uid_nfc || card.codigo_uid} className="nfc-card-box">
                                      <div className="nfc-card-header">
                                        <Wifi size={16} />
                                        <span className="nfc-uid">{card.codigo_uid || card.uid_nfc}</span>
                                      </div>
                                      <div className="nfc-card-body">
                                        <span className={`nfc-status-badge ${statusClass}`}>
                                          {statusLabel}
                                        </span>
                                        {card.id_reserva && (
                                          <span className="nfc-reservation">
                                            Reserva #{card.id_reserva}
                                          </span>
                                        )}
                                      </div>
                                      {card.data_inicio && (
                                        <div className="nfc-card-footer">
                                          <span className="nfc-date">
                                            Desde: {new Date(card.data_inicio).toLocaleDateString('pt-PT')}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <button
                            className="associate-button"
                            onClick={() => startAssociation(item.id)}
                          >
                            + Associar Novo CartÃ£o
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <p className="pagination-info">
            Mostrando {inventory.length === 0 ? 0 : indexOfFirstItem + 1} a {Math.min(indexOfLastItem, inventory.length)} de {inventory.length} artigos
          </p>
          <div className="pagination-controls">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="pagination-button">
              â† Anterior
            </button>
            <span className="pagination-text">
              PÃ¡gina {currentPage} de {totalPages}
            </span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="pagination-button">
              Seguinte â†’
            </button>
          </div>
        </div>
      )}

      {}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content add-article-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adicionar Artigo</h2>
              <button className="modal-close" onClick={closeAddModal}>Ã—</button>
            </div>

            <form className="modal-body" onSubmit={createArticle}>
              <label className="form-label full">Nome</label>
              <input
                className="form-input full"
                value={newArticle.nome}
                onChange={e => setNewArticle(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do artigo"
                required
              />

              <label className="form-label">Categoria</label>
              <select
                className="form-input"
                value={newArticle.id_subcat}
                onChange={e => setNewArticle(prev => ({ ...prev, id_subcat: e.target.value }))}
              >
                <option value="">-- N/A --</option>
                {categoriesList && categoriesList.map(cat => (
                  (cat.subcategorias && cat.subcategorias.length > 0) ? (
                    <optgroup key={cat.id_cat} label={cat.nome_cat}>
                      {cat.subcategorias.map(sub => (
                        <option key={sub.id_subcat} value={sub.id_subcat}>{sub.nome_subcat}</option>
                      ))}
                    </optgroup>
                  ) : (
                    <option key={cat.id_cat} value="">{cat.nome_cat}</option>
                  )
                ))}
              </select>

              <label className="form-label">LaboratÃ³rio</label>
              <select
                className="form-input"
                value={newArticle.id_lab}
                onChange={e => setNewArticle(prev => ({ ...prev, id_lab: e.target.value }))}
              >
                <option value="">-- N/A --</option>
                {labsList && labsList.map(l => (
                  <option key={l.id_lab} value={l.id_lab}>{`Lab ${l.num_lab}`}</option>
                ))}
              </select>

              <label className="form-label">Quantidade</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={newArticle.quantidade}
                onChange={e => setNewArticle(prev => ({ ...prev, quantidade: e.target.value }))}
              />

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeAddModal} disabled={adding}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={adding}>{adding ? 'A adicionar...' : 'Criar Artigo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content add-article-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Artigo</h2>
              <button className="modal-close" onClick={closeEditModal}>Ã—</button>
            </div>

            <form className="modal-body" onSubmit={updateArticle}>
              <label className="form-label full">Nome</label>
              <input
                className="form-input full"
                value={editArticle.nome}
                onChange={e => setEditArticle(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do artigo"
                required
              />

              <label className="form-label">Categoria</label>
              <select
                className="form-input"
                value={editArticle.id_cat || ''}
                onChange={e => setEditArticle(prev => ({ ...prev, id_cat: e.target.value }))}
              >
                <option value="">-- N/A --</option>
                {categoriesList && categoriesList.map(cat => (
                  <option key={cat.id_cat} value={cat.id_cat}>{cat.nome_cat}</option>
                ))}
              </select>

              <label className="form-label">LaboratÃ³rio</label>
              <select
                className="form-input"
                value={editArticle.id_lab}
                onChange={e => setEditArticle(prev => ({ ...prev, id_lab: e.target.value }))}
              >
                <option value="">-- N/A --</option>
                {labsList && labsList.map(l => (
                  <option key={l.id_lab} value={l.id_lab}>{`Lab ${l.num_lab}`}</option>
                ))}
              </select>

              <label className="form-label">Quantidade</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={editArticle.quantidade}
                onChange={e => setEditArticle(prev => ({ ...prev, quantidade: e.target.value }))}
              />

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeEditModal} disabled={editing}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={editing}>{editing ? 'A actualizar...' : 'Actualizar Artigo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showRFIDModal && (
        <div className="modal-overlay" onClick={closeRFIDModal}>
          <div className="modal-content rfid-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Associar CartÃ£o RFID</h2>
              <button className="modal-close" onClick={closeRFIDModal}>Ã—</button>
            </div>

            <div className="modal-body">
              <p className="modal-info">
                Artigo ID: <strong>{selectedArtigoId}</strong>
              </p>

              <div className={`rfid-status ${rfidStatus}`}>
                {rfidStatus === 'idle' && (
                  <div className="status-idle">
                    <Wifi size={48} />
                    <p>Pronto para ler cartÃ£o</p>
                  </div>
                )}

                {rfidStatus === 'reading' && (
                  <div className="status-reading">
                    <div className="spinner"></div>
                    <p>{rfidMessage}</p>
                  </div>
                )}

                {rfidStatus === 'success' && (
                  <div className="status-success">
                    <div className="success-icon">âœ“</div>
                    <p>{rfidMessage}</p>
                    {readUID && <p className="uid-display">UID: {readUID}</p>}
                  </div>
                )}

                {rfidStatus === 'error' && (
                  <div className="status-error">
                    <WifiOff size={48} />
                    <p>{rfidMessage}</p>
                  </div>
                )}
              </div>

              <div className="modal-instructions">
                <h4>InstruÃ§Ãµes:</h4>
                <ol>
                  <li>Clique em "Ler CartÃ£o"</li>
                  <li>Aproxime o cartÃ£o do leitor RC522</li>
                  <li>Aguarde a confirmaÃ§Ã£o</li>
                </ol>
                <p className="small-text">
                  <strong>Nota:</strong> Certifique-se de que o bridge local estÃ¡ rodando em seu computador.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={closeRFIDModal}
                disabled={rfidStatus === 'reading'}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={readRFIDCard}
                disabled={rfidStatus === 'reading' || rfidStatus === 'success'}
              >
                {rfidStatus === 'reading' ? 'Lendo...' : 'Ler CartÃ£o'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

