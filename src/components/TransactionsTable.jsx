import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export default function TransactionsTable({ transactions, onDeleteClient }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset pagination when filter triggers
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // Filter and search logic combined
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesPlan = planFilter === 'All' || t.plan === planFilter;
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [transactions, searchTerm, planFilter, statusFilter]);

  // Pagination bounds calculation
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Human readable translations for status css class
  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'active';
      case 'Past Due': return 'past_due';
      case 'Churned': return 'churned';
      default: return '';
    }
  };

  const translateStatus = (status) => {
    switch(status) {
      case 'Active': return 'Activo';
      case 'Past Due': return 'Vencido';
      case 'Churned': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="table-card fadeIn" style={{ animationDelay: '0.5s' }}>
      <div className="chart-card-header">
        <h4 className="chart-card-title">Registro de Suscriptores y Transacciones</h4>
      </div>

      {/* Control panel containing filters and search */}
      <div className="table-header-controls">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por ID, nombre o email..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select 
            className="filter-select"
            value={planFilter}
            onChange={(e) => handleFilterChange(setPlanFilter, e.target.value)}
          >
            <option value="All">Todos los planes</option>
            <option value="Basic">Plan Básico ($30.000)</option>
            <option value="Pro">Plan Pro ($60.000)</option>
            <option value="Enterprise">Plan Enterprise ($150.000)</option>
          </select>

          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
          >
            <option value="All">Todos los estados</option>
            <option value="Active">Activo</option>
            <option value="Past Due">Vencido</option>
            <option value="Churned">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className="table-wrapper">
        {paginatedTransactions.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Transacción</th>
                <th>Cliente</th>
                <th>Plan contratado</th>
                <th>Monto</th>
                <th>Fecha de pago</th>
                <th>Estado de cuenta</th>
                {onDeleteClient && <th>Acción</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="text-bold">{tx.id}</td>
                  <td>
                    <div className="customer-badge">
                      <div className="avatar">{tx.avatar}</div>
                      <div className="customer-info">
                        <span className="customer-name">{tx.name}</span>
                        <span className="customer-email">{tx.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-bold">{tx.plan}</span>
                  </td>
                  <td className="text-bold">${tx.amount}</td>
                  <td>{tx.date}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(tx.status)}`}>
                      {translateStatus(tx.status)}
                    </span>
                  </td>
                  {onDeleteClient && (
                    <td>
                      <button 
                        onClick={() => onDeleteClient(tx.id)}
                        className="btn-secondary" 
                        style={{ padding: '0.4rem', border: 'none', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No se encontraron transacciones que coincidan con los filtros seleccionados.
          </div>
        )}
      </div>

      {/* Table Pagination */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <span>
            Mostrando pág. <b>{currentPage}</b> de <b>{totalPages}</b> (Filtrados: {filteredTransactions.length} registros)
          </span>
          <div className="pagination-buttons">
            <button 
              className="btn-page" 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="btn-page" 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
