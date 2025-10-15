import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 100,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [pageSize, setPageSize] = useState(100);

  // Filter states
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    branches: [],
    suppliers: []
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  
  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // Totals state
  const [totals, setTotals] = useState({
    totalNetSlsQty: 0,
    totalNetAmount: 0,
    totalNetSlsCostValue: 0,
    totalSlsExtCostValue: 0
  });

  const fetchFilters = async () => {
    try {
      const response = await axios.get(`${API_URL}/filters`);
      const filters = response.data.filters;
      setAvailableFilters(filters);
      
      // By default, select all items
      setSelectedCategories(filters.categories);
      setSelectedBranches(filters.branches);
      setSelectedSuppliers(filters.suppliers);
      setFiltersLoaded(true);
    } catch (error) {
      console.error('Error fetching filters:', error);
      setError('Error fetching filters from server.');
    }
  };

  const fetchData = useCallback(async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);
      setError('');
      const [dataResponse, totalsResponse] = await Promise.all([
        axios.get(`${API_URL}/data`, {
          params: { 
            page, 
            limit,
            categories: JSON.stringify(selectedCategories),
            branches: JSON.stringify(selectedBranches),
            suppliers: JSON.stringify(selectedSuppliers)
          }
        }),
        axios.get(`${API_URL}/totals`, {
          params: {
            categories: JSON.stringify(selectedCategories),
            branches: JSON.stringify(selectedBranches),
            suppliers: JSON.stringify(selectedSuppliers)
          }
        })
      ]);
      
      const fetchedData = dataResponse.data.data;
      setData(fetchedData);
      setPagination(dataResponse.data.pagination);
      setTotals(totalsResponse.data.totals);
      
      // Only display specific columns
      const allowedColumns = [
        'CategoryShortName',
        'branch',
        'SupplierAlias',
        'ArticleNo',
        'NetSlsQty',
        'NetAmount',
        'NetSlsCostValue',
        'SlsExtCostValue'
      ];
      setColumns(allowedColumns);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data from server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [pageSize, selectedCategories, selectedBranches, selectedSuppliers]);

  // Fetch filters on component mount
  useEffect(() => {
    fetchFilters();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (filtersLoaded) {
      fetchData(1, pageSize);
    }
  }, [selectedCategories, selectedBranches, selectedSuppliers, filtersLoaded, fetchData, pageSize]);

  const handlePageChange = (newPage) => {
    fetchData(newPage, pageSize);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    fetchData(1, newSize);
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => handlePageChange(pagination.totalPages);
  const goToPrevPage = () => handlePageChange(pagination.currentPage - 1);
  const goToNextPage = () => handlePageChange(pagination.currentPage + 1);

  // Filter handlers
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBranchToggle = (branch) => {
    setSelectedBranches(prev => 
      prev.includes(branch) 
        ? prev.filter(b => b !== branch)
        : [...prev, branch]
    );
  };

  const handleSupplierToggle = (supplier) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplier) 
        ? prev.filter(s => s !== supplier)
        : [...prev, supplier]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(availableFilters.categories);
  };

  const handleClearAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleSelectAllBranches = () => {
    setSelectedBranches(availableFilters.branches);
  };

  const handleClearAllBranches = () => {
    setSelectedBranches([]);
  };

  const handleSelectAllSuppliers = () => {
    setSelectedSuppliers(availableFilters.suppliers);
  };

  const handleClearAllSuppliers = () => {
    setSelectedSuppliers([]);
  };

  return (
    <div className="App">
      <div className="container">
        <h1>📊 Data Management Dashboard</h1>
        
        {/* Header Section */}
        <div className="header-section">
          <div className="stats-box">
            <div className="stat-item">
              <span className="stat-label">Total Records</span>
              <span className="stat-value">{pagination.totalRecords.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Current Page</span>
              <span className="stat-value">{pagination.currentPage} / {pagination.totalPages}</span>
            </div>
            <button 
              onClick={() => fetchData(pagination.currentPage, pageSize)} 
              disabled={loading}
              className="refresh-btn"
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
            </button>
          </div>
        </div>

        {/* Totals Section */}
        <div className="totals-section">
          <h2>📊 Totals Summary</h2>
          <div className="totals-grid">
            <div className="total-card">
              <div className="total-label">Total NetSlsQty</div>
              <div className="total-value">{totals.totalNetSlsQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="total-card">
              <div className="total-label">Total NetAmount</div>
              <div className="total-value">₹{totals.totalNetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="total-card">
              <div className="total-label">Total NetSlsCostValue</div>
              <div className="total-value">₹{totals.totalNetSlsCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="total-card">
              <div className="total-label">Total SlsExtCostValue</div>
              <div className="total-value">₹{totals.totalSlsExtCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {/* Pagination Controls - Top */}
        <div className="pagination-controls">
          <div className="page-size-selector">
            <label>Rows per page:</label>
            <select value={pageSize} onChange={handlePageSizeChange} disabled={loading}>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
          </div>
          
          <div className="page-info">
            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)} of {pagination.totalRecords.toLocaleString()} records
          </div>

          <div className="page-buttons">
            <button 
              onClick={goToFirstPage} 
              disabled={!pagination.hasPrevPage || loading}
              title="First Page"
            >
              ⏮️
            </button>
            <button 
              onClick={goToPrevPage} 
              disabled={!pagination.hasPrevPage || loading}
              title="Previous Page"
            >
              ◀️
            </button>
            <span className="page-indicator">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={!pagination.hasNextPage || loading}
              title="Next Page"
            >
              ▶️
            </button>
            <button 
              onClick={goToLastPage} 
              disabled={!pagination.hasNextPage || loading}
              title="Last Page"
            >
              ⏭️
            </button>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="table-section">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading data from database...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <p>No data available in the database.</p>
              <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                Run the import script to load data: <code>npm run import</code>
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    {columns.map((col) => (
                      <th key={col} className={col === 'CategoryShortName' || col === 'branch' || col === 'SupplierAlias' ? 'filterable-column' : ''}>
                        <div className="th-content">
                          <span>{col}</span>
                          {col === 'CategoryShortName' && (
                            <div className="filter-dropdown-wrapper">
                              <button 
                                className="filter-toggle-btn"
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                title="Filter Category"
                              >
                                ▼
                              </button>
                              {showCategoryDropdown && (
                                <div className="filter-dropdown">
                                  <div className="filter-dropdown-header">
                                    <button 
                                      onClick={handleSelectAllCategories}
                                      className="filter-dropdown-btn select"
                                    >
                                      Select All
                                    </button>
                                    <button 
                                      onClick={handleClearAllCategories}
                                      className="filter-dropdown-btn clear"
                                    >
                                      Clear All
                                    </button>
                                  </div>
                                  <div className="filter-dropdown-list">
                                    {availableFilters.categories.map((category) => (
                                      <label key={category} className="filter-dropdown-item">
                                        <input
                                          type="checkbox"
                                          checked={selectedCategories.includes(category)}
                                          onChange={() => handleCategoryToggle(category)}
                                        />
                                        <span>{category}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {col === 'branch' && (
                            <div className="filter-dropdown-wrapper">
                              <button 
                                className="filter-toggle-btn"
                                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                                title="Filter Branch"
                              >
                                ▼
                              </button>
                              {showBranchDropdown && (
                                <div className="filter-dropdown">
                                  <div className="filter-dropdown-header">
                                    <button 
                                      onClick={handleSelectAllBranches}
                                      className="filter-dropdown-btn select"
                                    >
                                      Select All
                                    </button>
                                    <button 
                                      onClick={handleClearAllBranches}
                                      className="filter-dropdown-btn clear"
                                    >
                                      Clear All
                                    </button>
                                  </div>
                                  <div className="filter-dropdown-list">
                                    {availableFilters.branches.map((branch) => (
                                      <label key={branch} className="filter-dropdown-item">
                                        <input
                                          type="checkbox"
                                          checked={selectedBranches.includes(branch)}
                                          onChange={() => handleBranchToggle(branch)}
                                        />
                                        <span>{branch}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {col === 'SupplierAlias' && (
                            <div className="filter-dropdown-wrapper">
                              <button 
                                className="filter-toggle-btn"
                                onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
                                title="Filter Supplier"
                              >
                                ▼
                              </button>
                              {showSupplierDropdown && (
                                <div className="filter-dropdown">
                                  <div className="filter-dropdown-header">
                                    <button 
                                      onClick={handleSelectAllSuppliers}
                                      className="filter-dropdown-btn select"
                                    >
                                      Select All
                                    </button>
                                    <button 
                                      onClick={handleClearAllSuppliers}
                                      className="filter-dropdown-btn clear"
                                    >
                                      Clear All
                                    </button>
                                  </div>
                                  <div className="filter-dropdown-list">
                                    {availableFilters.suppliers.map((supplier) => (
                                      <label key={supplier} className="filter-dropdown-item">
                                        <input
                                          type="checkbox"
                                          checked={selectedSuppliers.includes(supplier)}
                                          onChange={() => handleSupplierToggle(supplier)}
                                        />
                                        <span>{supplier}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={row._id || index}>
                      <td>{((pagination.currentPage - 1) * pagination.pageSize) + index + 1}</td>
                      {columns.map((col) => (
                        <td key={col}>{row[col] !== undefined ? String(row[col]) : '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls - Bottom */}
        {data.length > 0 && (
          <div className="pagination-controls bottom">
            <div className="page-info">
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)} of {pagination.totalRecords.toLocaleString()} records
            </div>

            <div className="page-buttons">
              <button 
                onClick={goToFirstPage} 
                disabled={!pagination.hasPrevPage || loading}
                title="First Page"
              >
                ⏮️
              </button>
              <button 
                onClick={goToPrevPage} 
                disabled={!pagination.hasPrevPage || loading}
                title="Previous Page"
              >
                ◀️
              </button>
              <span className="page-indicator">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button 
                onClick={goToNextPage} 
                disabled={!pagination.hasNextPage || loading}
                title="Next Page"
              >
                ▶️
              </button>
              <button 
                onClick={goToLastPage} 
                disabled={!pagination.hasNextPage || loading}
                title="Last Page"
              >
                ⏭️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
