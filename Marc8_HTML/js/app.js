// ===== CORE APP INTERACTIVITY =====
(function () {
  'use strict';

  // === UTILITIES ===
  function formatCurrency(amount) {
    if (amount == null) return '₹0';
    return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  function debounce(fn, delay) {
    let timer;
    return function () {
      const ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(ctx, args), delay);
    };
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function statusBadge(status, dot) {
    const variants = {
      completed: 'badge-success', active: 'badge-info', confirmed: 'badge-info',
      pending: 'badge-warning', cancelled: 'badge-destructive', refunded: 'badge-secondary',
      approved: 'badge-success', rejected: 'badge-destructive', flagged: 'badge-warning',
      collected: 'badge-success', overdue: 'badge-destructive', waived: 'badge-secondary',
      paid: 'badge-success', partially_paid: 'badge-warning', in_progress: 'badge-info',
      disputed: 'badge-destructive', scheduled: 'badge-info', no_show: 'badge-destructive',
      high: 'badge-destructive', medium: 'badge-warning', low: 'badge-secondary', critical: 'badge-destructive',
    };
    const cls = variants[status] || 'badge-secondary';
    const label = status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
    return '<span class="badge ' + cls + (dot ? ' badge-dot' : '') + '">' + escapeHtml(label) + '</span>';
  }

  // === SIDEBAR ===
  window.toggleSidebar = function () {
    const sidebar = document.getElementById('sidebar');
    const wrapper = document.getElementById('main-content-wrapper');
    const logoText = document.getElementById('sidebar-logo-text');
    const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
    if (isCollapsed) {
      sidebar.classList.replace('sidebar-collapsed', 'sidebar-expanded');
      wrapper.classList.replace('ml-16', 'ml-64');
      document.querySelectorAll('.sidebar-item span').forEach(s => s.style.display = '');
      if (logoText) logoText.style.display = '';
      document.querySelectorAll('.sidebar-section-label').forEach(s => s.style.display = '');
      localStorage.setItem('sidebar-collapsed', 'false');
    } else {
      sidebar.classList.replace('sidebar-expanded', 'sidebar-collapsed');
      wrapper.classList.replace('ml-64', 'ml-16');
      document.querySelectorAll('.sidebar-item span').forEach(s => s.style.display = 'none');
      if (logoText) logoText.style.display = 'none';
      document.querySelectorAll('.sidebar-section-label').forEach(s => s.style.display = 'none');
      document.querySelectorAll('.chevron').forEach(s => s.style.display = 'none');
      localStorage.setItem('sidebar-collapsed', 'true');
    }
  };

  function initSidebar() {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      const sidebar = document.getElementById('sidebar');
      const wrapper = document.getElementById('main-content-wrapper');
      if (sidebar && wrapper) {
        sidebar.classList.replace('sidebar-expanded', 'sidebar-collapsed');
        wrapper.classList.replace('ml-64', 'ml-16');
        document.querySelectorAll('.sidebar-item span').forEach(s => s.style.display = 'none');
        const logoText = document.getElementById('sidebar-logo-text');
        if (logoText) logoText.style.display = 'none';
        document.querySelectorAll('.sidebar-section-label').forEach(s => s.style.display = 'none');
        document.querySelectorAll('.chevron').forEach(s => s.style.display = 'none');
      }
    }
    setActiveNavItem();

    document.querySelectorAll('.sidebar-nav-group > button').forEach(btn => {
      btn.addEventListener('click', function () {
        const group = this.parentElement;
        const sub = group.querySelector('.overflow-hidden');
        const chevron = this.querySelector('.chevron');
        const isOpen = group.classList.toggle('expanded');
        sub.style.maxHeight = isOpen ? sub.scrollHeight + 'px' : '0';
        if (chevron) chevron.style.transform = isOpen ? 'rotate(180deg)' : '';
      });
    });

    // Open parent groups if child is active
    document.querySelectorAll('.sidebar-item[data-nav]').forEach(item => {
      const page = document.body.dataset.page;
      if (item.dataset.nav.toLowerCase().replace(/\s+/g, '-') === page) {
        item.classList.add('active');
        const group = item.closest('.sidebar-nav-group');
        if (group) {
          group.classList.add('expanded');
          const sub = group.querySelector('.overflow-hidden');
          if (sub) sub.style.maxHeight = sub.scrollHeight + 'px';
          const chevron = group.querySelector('.chevron');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
      }
    });
  }

  function setActiveNavItem() {
    const page = document.body.dataset.page;
    document.querySelectorAll('.sidebar-item[data-nav]').forEach(item => {
      const navKey = item.dataset.nav.toLowerCase().replace(/\s+/g, '-');
      if (navKey === page) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // === DROPDOWNS ===
  function initDropdowns() {
    document.addEventListener('click', function (e) {
      const toggle = e.target.closest('.dropdown-toggle');
      if (toggle) {
        e.preventDefault();
        const id = toggle.dataset.dropdown;
        const content = document.getElementById(id);
        if (content) {
          const isHidden = content.classList.contains('hidden');
          document.querySelectorAll('.dropdown-content').forEach(d => d.classList.add('hidden'));
          if (isHidden) content.classList.remove('hidden');
        }
        return;
      }
      if (!e.target.closest('.dropdown-content') && !e.target.closest('.dropdown-toggle')) {
        document.querySelectorAll('.dropdown-content').forEach(d => d.classList.add('hidden'));
      }
    });
  }

  // === MODALS / DRAWERS ===
  window.openModal = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  };
  window.closeModal = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  };
  window.openDrawer = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };
  window.closeDrawer = function (id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
    document.body.style.overflow = '';
  };

  function initModals() {
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.add('hidden');
        document.body.style.overflow = '';
      }
      if (e.target.classList.contains('drawer-overlay')) {
        e.target.classList.add('hidden');
        const drawer = e.target.nextElementSibling;
        if (drawer && drawer.classList.contains('drawer')) {
          drawer.classList.add('hidden');
        }
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => {
          m.classList.add('hidden');
          document.body.style.overflow = '';
        });
        document.querySelectorAll('.drawer-overlay:not(.hidden)').forEach(d => {
          d.classList.add('hidden');
          const drawer = d.nextElementSibling;
          if (drawer && drawer.classList.contains('drawer')) drawer.classList.add('hidden');
          document.body.style.overflow = '';
        });
        closeCommandPalette();
      }
    });
  }

  // === TOASTS ===
  window.showToast = function (message, type) {
    type = type || 'info';
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = {
      success: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#183eeb' };
    const id = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = id;
    toast.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-left:3px solid ' + colors[type] + ';border-radius:0.5rem;padding:0.75rem 1rem;display:flex;align-items:center;gap:0.75rem;min-width:300px;max-width:420px;box-shadow:0 10px 30px rgba(0,0,0,0.3);animation:slideInRight 0.3s ease-out;pointer-events:auto;';
    toast.innerHTML = '<span style="color:' + colors[type] + ';flex-shrink:0;">' + (icons[type] || icons.info) + '</span><span style="font-size:0.875rem;color:var(--foreground);flex:1;">' + escapeHtml(message) + '</span><button onclick="removeToast(\'' + id + '\')" style="background:none;border:none;color:var(--muted-foreground);cursor:pointer;padding:0.25rem;flex-shrink:0;"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    container.appendChild(toast);
    setTimeout(function () {
      removeToast(id);
    }, 4000);
  };

  window.removeToast = function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }
  };

  // === COMMAND PALETTE ===
  var commandPaletteOpen = false;
  window.openCommandPalette = function () {
    const el = document.getElementById('command-palette');
    if (el) { el.classList.remove('hidden'); commandPaletteOpen = true; setTimeout(function () { var inp = document.getElementById('command-input'); if (inp) inp.focus(); }, 100); }
  };
  window.closeCommandPalette = function () {
    const el = document.getElementById('command-palette');
    if (el) { el.classList.add('hidden'); commandPaletteOpen = false; }
  };

  function initCommandPalette() {
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (commandPaletteOpen) closeCommandPalette();
        else openCommandPalette();
      }
    });
    var input = document.getElementById('command-input');
    if (input) {
      input.addEventListener('input', function () {
        var q = this.value.toLowerCase().trim();
        var results = document.getElementById('command-results');
        if (!results) return;
        var pages = [
          { label: 'Dashboard', href: 'dashboard.html' },
          { label: 'Bookings', href: 'bookings.html' },
          { label: 'Journal Ledger', href: 'journal-ledger.html' },
          { label: 'Expenses', href: 'expenses.html' },
          { label: 'Settlements', href: 'settlements.html' },
          { label: 'Outstandings', href: 'outstandings.html' },
          { label: 'Fleet Dashboard', href: 'fleet-dashboard.html' },
          { label: 'Maintenance', href: 'maintenance.html' },
          { label: 'Service Schedules', href: 'service-schedules.html' },
          { label: 'Analytics', href: 'analytics.html' },
          { label: 'Reports', href: 'reports.html' },
          { label: 'Notifications', href: 'notifications.html' },
          { label: 'Operations', href: 'operations.html' },
          { label: 'Automation', href: 'automation.html' },
          { label: 'Customers', href: 'customers.html' },
          { label: 'Vendors', href: 'vendors.html' },
          { label: 'Drivers', href: 'drivers.html' },
          { label: 'Vehicles', href: 'vehicles.html' },
          { label: 'Vehicle Owners', href: 'vehicle-owners.html' },
          { label: 'Accounts', href: 'accounts.html' },
          { label: 'Platforms', href: 'platform-masters.html' },
          { label: 'Expense Categories', href: 'expense-categories.html' },
          { label: 'Payment Modes', href: 'payment-modes.html' },
          { label: 'Settings', href: 'settings.html' },
        ];
        if (!q) {
          results.innerHTML = '<div class="px-2 py-4 text-center text-sm text-secondary-500">Start typing to search...</div>';
          return;
        }
        var filtered = pages.filter(function (p) { return p.label.toLowerCase().includes(q); });
        if (filtered.length === 0) {
          results.innerHTML = '<div class="px-2 py-4 text-center text-sm text-secondary-500">No results found</div>';
        } else {
          results.innerHTML = filtered.map(function (p) {
            return '<a href="' + p.href + '" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-surface-light transition-colors" onclick="closeCommandPalette()"><svg class="h-4 w-4 text-secondary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>' + escapeHtml(p.label) + '</span></a>';
          }).join('');
        }
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeCommandPalette();
      });
    }
    document.getElementById('command-palette')?.addEventListener('click', function (e) {
      if (e.target === this) closeCommandPalette();
    });
  }

  // === TABLES ===
  function initTable(tableId, options) {
    var table = document.getElementById(tableId);
    if (!table) return;
    var tbody = table.querySelector('tbody');
    var searchInput = document.querySelector('[data-table-search="' + tableId + '"]');
    var statusFilter = document.querySelector('[data-table-filter="' + tableId + '"]');
    var paginationEl = document.querySelector('[data-table-pagination="' + tableId + '"]');

    var data = options.data || [];
    var columns = options.columns || [];
    var pageSize = options.pageSize || 10;
    var currentPage = 1;
    var filteredData = data.slice();

    function render() {
      if (!tbody) return;
      var start = (currentPage - 1) * pageSize;
      var end = Math.min(start + pageSize, filteredData.length);
      var pageData = filteredData.slice(start, end);

      if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="' + columns.length + '" class="table-empty"><div class="table-empty-icon"><svg class="h-8 w-8 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><div class="table-empty-text">' + (options.emptyMessage || 'No data found') + '</div></td></tr>';
      } else {
        tbody.innerHTML = pageData.map(function (row) {
          return '<tr>' + columns.map(function (col) {
            var val = col.render ? col.render(row) : (row[col.key] != null ? row[col.key] : '-');
            return '<td' + (col.width ? ' style="width:' + col.width + '"' : '') + '>' + val + '</td>';
          }).join('') + '</tr>';
        }).join('');
      }

      // Pagination
      if (paginationEl) {
        var totalPages = Math.ceil(filteredData.length / pageSize) || 1;
        var info = paginationEl.querySelector('.pagination-info');
        if (info) info.textContent = 'Showing ' + (filteredData.length > 0 ? (start + 1) + '-' + end + ' of ' + filteredData.length : '0 results');
        var btns = paginationEl.querySelector('.pagination-buttons');
        if (btns) {
          var html = '<button class="pagination-btn" onclick="window.goToPage(\'' + tableId + '\', ' + (currentPage - 1) + ')" ' + (currentPage <= 1 ? 'disabled' : '') + '>‹</button>';
          for (var i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
              html += '<button class="pagination-btn' + (i === currentPage ? ' active' : '') + '" onclick="window.goToPage(\'' + tableId + '\', ' + i + ')">' + i + '</button>';
            } else if (i === currentPage - 2 || i === currentPage + 2) {
              html += '<button class="pagination-btn" disabled>…</button>';
            }
          }
          html += '<button class="pagination-btn" onclick="window.goToPage(\'' + tableId + '\', ' + (currentPage + 1) + ')" ' + (currentPage >= totalPages ? 'disabled' : '') + '>›</button>';
          btns.innerHTML = html;
        }
      }
    }

    window.goToPage = function (tid, page) {
      if (tid === tableId) {
        currentPage = page;
        render();
      }
    };

    // Search
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function () {
        var q = this.value.toLowerCase().trim();
        filteredData = q ? data.filter(function (row) {
          return columns.some(function (col) {
            var val = row[col.key];
            return val != null && String(val).toLowerCase().includes(q);
          });
        }) : data.slice();
        currentPage = 1;
        render();
      }, 300));
    }

    // Filter
    if (statusFilter) {
      statusFilter.addEventListener('change', function () {
        var val = this.value;
        var key = this.dataset.filterKey || 'status';
        filteredData = val ? data.filter(function (row) { return row[key] === val; }) : data.slice();
        currentPage = 1;
        render();
      });
    }

    // Sort on header click
    table.querySelectorAll('th.sortable').forEach(function (th) {
      th.addEventListener('click', function () {
        var key = this.dataset.sortKey;
        if (!key) return;
        var order = this.dataset.sortOrder === 'asc' ? 'desc' : 'asc';
        this.dataset.sortOrder = order;
        table.querySelectorAll('th.sortable').forEach(function (h) { if (h !== th) h.dataset.sortOrder = ''; });
        filteredData.sort(function (a, b) {
          var va = a[key], vb = b[key];
          if (typeof va === 'string') va = va.toLowerCase();
          if (typeof vb === 'string') vb = vb.toLowerCase();
          if (va < vb) return order === 'asc' ? -1 : 1;
          if (va > vb) return order === 'asc' ? 1 : -1;
          return 0;
        });
        render();
      });
    });

    render();
  }

  // === CHARTS ===
  function renderBarChart(canvasId, data, options) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || !data || data.length === 0) return;
    var ctx = canvas.getContext('2d');
    var parent = canvas.parentElement;
    canvas.width = parent.clientWidth || 400;
    canvas.height = parent.clientHeight || 250;
    var w = canvas.width, h = canvas.height;
    var padding = { top: 20, right: 20, bottom: 40, left: 20 };
    var chartW = w - padding.left - padding.right;
    var chartH = h - padding.top - padding.bottom;
    var maxVal = Math.max.apply(null, data.map(function (d) { return d.value || 0; })) * 1.1 || 1;
    var barW = Math.min(chartW / data.length * 0.6, 40);
    var gap = (chartW - barW * data.length) / (data.length + 1);

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(51,65,85,0.3)';
    ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Manrope, Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('₹' + Math.round(maxVal * (1 - i / 4)).toLocaleString('en-IN'), padding.left - 5, y + 3);
    }

    var colors = options && options.colors ? options.colors : ['#183eeb', '#22c55e', '#ff7200', '#ef4444', '#8b5cf6'];

    // Bars
    data.forEach(function (d, i) {
      var x = padding.left + gap + i * (barW + gap);
      var barH = (d.value / maxVal) * chartH;
      var y = padding.top + chartH - barH;
      var color = d.color || colors[i % colors.length];
      var grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '40');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
      ctx.fill();

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Manrope, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label || '', x + barW / 2, padding.top + chartH + 16);
    });
  }

  function renderPieChart(canvasId, data) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || !data || data.length === 0) return;
    var ctx = canvas.getContext('2d');
    var size = Math.min(canvas.parentElement.clientWidth || 200, canvas.parentElement.clientHeight || 200, 200);
    canvas.width = size;
    canvas.height = size;
    var cx = size / 2, cy = size / 2, r = size / 2 - 10;
    var total = data.reduce(function (s, d) { return s + (d.value || 0); }, 0) || 1;
    var colors = ['#183eeb', '#22c55e', '#ff7200', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];
    var startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, size, size);

    data.forEach(function (d, i) {
      var sliceAngle = (d.value / total) * 2 * Math.PI;
      var color = d.color || colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Center hole (donut)
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
  }

  // === DASHBOARD ===
  function initDashboard() {
    var data = DATA.getDashboard();
    var kpis = data.kpis;

    function setKPI(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    setKPI('kpi-today-revenue', formatCurrency(kpis.todays_revenue));
    setKPI('kpi-weekly-revenue', formatCurrency(kpis.weekly_revenue));
    setKPI('kpi-monthly-profit', formatCurrency(kpis.monthly_profit));
    setKPI('kpi-cash-flow', formatCurrency(kpis.cash_flow));
    setKPI('kpi-active-vehicles', kpis.active_vehicles + '/' + kpis.total_vehicles);
    setKPI('kpi-utilization', kpis.utilization_rate + '%');
    setKPI('kpi-outstanding', formatCurrency(kpis.outstanding_collections));
    setKPI('kpi-net-margin', kpis.net_margin + '%');

    // Revenue trend chart
    if (data.trends && data.trends.revenue) {
      renderBarChart('chart-revenue', data.trends.revenue.map(function (d) { return { label: d.month, value: d.total }; }), { colors: ['#22c55e'] });
    }
    // Expense trend
    if (data.trends && data.trends.expense) {
      renderBarChart('chart-expense', data.trends.expense.map(function (d) { return { label: d.month, value: d.total }; }), { colors: ['#ef4444'] });
    }

    // Revenue by platform pie
    if (data.breakdowns && data.breakdowns.revenue_by_platform) {
      renderPieChart('chart-platform-pie', data.breakdowns.revenue_by_platform.map(function (d) { return { label: d.name, value: d.total }; }));
      // Legend
      var legend = document.getElementById('chart-legend-platform');
      if (legend) {
        legend.innerHTML = data.breakdowns.revenue_by_platform.slice(0, 5).map(function (d, i) {
          var colors = ['#183eeb', '#22c55e', '#ff7200', '#ef4444', '#8b5cf6'];
          return '<div class="chart-legend-item"><span class="chart-legend-dot" style="background:' + colors[i] + '"></span>' + escapeHtml(d.name) + ': ' + formatCurrency(d.total) + '</div>';
        }).join('');
      }
    }

    // Expense by category
    if (data.breakdowns && data.breakdowns.expense_by_category) {
      renderPieChart('chart-expense-pie', data.breakdowns.expense_by_category.map(function (d) { return { label: d.name, value: d.total }; }));
      var legend = document.getElementById('chart-legend-expense');
      if (legend) {
        legend.innerHTML = data.breakdowns.expense_by_category.slice(0, 5).map(function (d, i) {
          var colors = ['#ef4444', '#f59e0b', '#ff7200', '#06b6d4', '#8b5cf6'];
          return '<div class="chart-legend-item"><span class="chart-legend-dot" style="background:' + colors[i] + '"></span>' + escapeHtml(d.name) + ': ' + formatCurrency(d.total) + '</div>';
        }).join('');
      }
    }

    // Fleet health
    if (data.fleet_health) {
      var fh = data.fleet_health;
      setKPI('fh-score', fh.health_score + '%');
      setKPI('fh-insurance', fh.insurance_due);
      setKPI('fh-maintenance', fh.maintenance_due);
      setKPI('fh-permit', fh.permit_due);
    }

    // Alerts
    var alertsEl = document.getElementById('alerts-list');
    if (alertsEl && data.alerts) {
      var alerts = [];
      if (data.alerts.vehicles_without_bookings > 0) alerts.push({ type: 'warning', msg: data.alerts.vehicles_without_bookings + ' vehicles have no bookings' });
      if (data.alerts.pending_journal_entries > 0) alerts.push({ type: 'info', msg: data.alerts.pending_journal_entries + ' journal entries pending' });
      if (data.alerts.pending_expenses > 0) alerts.push({ type: 'error', msg: data.alerts.pending_expenses + ' expenses pending approval' });
      if (data.alerts.high_expense_vehicles && data.alerts.high_expense_vehicles.length > 0) {
        data.alerts.high_expense_vehicles.forEach(function (v) {
          alerts.push({ type: 'error', msg: v.vehicle_number + ' has high expenses: ' + formatCurrency(v.total_expense) });
        });
      }
      if (alerts.length === 0) {
        alertsEl.innerHTML = '<div class="text-sm text-secondary-500">No alerts</div>';
      } else {
        alertsEl.innerHTML = alerts.map(function (a) {
          var icon = a.type === 'warning' ? 'warning' : a.type === 'error' ? 'error' : 'info';
          return '<div class="alert-item alert-' + icon + '"><svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span class="text-sm">' + escapeHtml(a.msg) + '</span></div>';
        }).join('');
      }
    }

    // Recent activity
    var activityEl = document.getElementById('recent-activity');
    if (activityEl && data.recent) {
      var items = [];
      (data.recent.latest_bookings || []).forEach(function (b) {
        items.push({ text: 'Booking ' + b.booking_id + ' - ' + b.vehicle_number + ' (' + b.platform_name + ')', time: b.created_at, dot: '#22c55e' });
      });
      (data.recent.latest_expenses || []).forEach(function (e) {
        items.push({ text: 'Expense ' + e.invoice_number + ' - ' + e.category_name + ' ' + formatCurrency(e.amount), time: e.created_at, dot: '#ef4444' });
      });
      items.sort(function (a, b) { return new Date(b.time) - new Date(a.time); });
      items = items.slice(0, 10);
      activityEl.innerHTML = items.map(function (item) {
        return '<div class="activity-item"><span class="activity-dot" style="background:' + item.dot + '"></span><div class="activity-content"><div class="text-sm">' + escapeHtml(item.text) + '</div><div class="text-xs text-secondary-500 mt-0.5">' + formatDateTime(item.time) + '</div></div></div>';
      }).join('');
    }

    // Top vehicles table
    var topVehBody = document.getElementById('top-vehicles-body');
    if (topVehBody && data.top_vehicles && data.top_vehicles.top_performing) {
      var sorted = data.top_vehicles.top_performing.slice().sort(function (a, b) { return b.total_revenue - a.total_revenue; }).slice(0, 5);
      topVehBody.innerHTML = sorted.map(function (v) {
        return '<tr><td class="font-mono text-xs">' + escapeHtml(v.name) + '</td><td class="text-emerald-400 font-medium">' + formatCurrency(v.total_revenue) + '</td></tr>';
      }).join('');
    }

    // Fleet health bar
    var healthBar = document.getElementById('health-score-bar');
    if (healthBar && data.fleet_health) {
      healthBar.style.width = data.fleet_health.health_score + '%';
      var scoreText = document.getElementById('health-score-text');
      if (scoreText) scoreText.textContent = data.fleet_health.health_score + '%';
    }
  }

  // === CONFIRMATION DIALOG ===
  function initConfirmDialog() {
    var overlay = document.getElementById('confirm-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'confirm-overlay';
      overlay.className = 'modal-overlay hidden';
      overlay.innerHTML = '<div class="modal-content" style="max-width:28rem;" id="confirm-dialog"><div class="modal-body"><div class="confirm-dialog"><div class="confirm-dialog-icon destructive" id="confirm-icon"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><h3 class="text-lg font-semibold mb-2" id="confirm-title">Confirm</h3><p class="text-sm text-secondary-400 mb-6" id="confirm-desc">Are you sure?</p><div class="flex justify-center gap-3"><button class="btn btn-outline btn-md" onclick="closeConfirmDialog()">Cancel</button><button class="btn btn-primary btn-md" id="confirm-btn">Confirm</button></div></div></div></div>';
      document.body.appendChild(overlay);
    }
  }

  var confirmCallback = null;
  window.openConfirmDialog = function (options) {
    var overlay = document.getElementById('confirm-overlay');
    if (!overlay) initConfirmDialog();
    document.getElementById('confirm-title').textContent = options.title || 'Confirm';
    document.getElementById('confirm-desc').textContent = options.description || 'Are you sure?';
    var btn = document.getElementById('confirm-btn');
    btn.textContent = options.confirmLabel || 'Confirm';
    btn.className = 'btn btn-md ' + (options.variant === 'destructive' ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary');
    confirmCallback = options.onConfirm || null;
    overlay.classList.remove('hidden');
  };
  window.closeConfirmDialog = function () {
    var overlay = document.getElementById('confirm-overlay');
    if (overlay) overlay.classList.add('hidden');
    confirmCallback = null;
  };
  document.addEventListener('click', function (e) {
    if (e.target.id === 'confirm-btn' && confirmCallback) {
      confirmCallback();
      closeConfirmDialog();
    }
  });

  // === BOOKING DRAWER FORM ===
  function initBookingForm() {
    var form = document.getElementById('booking-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast('Booking saved successfully', 'success');
      closeDrawer('booking-drawer');
    });
  }

  // === INIT ===
  document.addEventListener('DOMContentLoaded', function () {
    initSidebar();
    initDropdowns();
    initModals();
    initCommandPalette();
    initConfirmDialog();
    initBookingForm();

    var page = document.body.dataset.page;

    // Dashboard
    if (page === 'dashboard') initDashboard();

    // Bookings
    if (page === 'bookings') {
      var columns = [
        { key: 'booking_id', render: function (r) { return '<span class="font-mono text-xs font-medium text-white">' + escapeHtml(r.booking_id) + '</span>'; } },
        { key: 'vehicle_number', render: function (r) { return '<div><span class="text-white">' + escapeHtml(r.vehicle_number) + '</span><p class="text-xs text-secondary-400">' + escapeHtml(r.vehicle_name || '') + '</p></div>'; } },
        { key: 'platform_name' },
        { key: 'created_at', render: function (r) { return '<span class="text-secondary-300">' + formatDate(r.created_at) + '</span>'; } },
        { key: 'net_revenue', render: function (r) { return '<span class="text-emerald-400 font-medium">' + formatCurrency(r.net_revenue) + '</span>'; } },
        { key: 'status', render: function (r) { return statusBadge(r.status, true); } },
        { key: 'actions', render: function (r) { return '<div class="dropdown"><button class="btn btn-ghost btn-icon btn-sm dropdown-toggle" data-dropdown="act-' + r.id + '"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button><div id="act-' + r.id + '" class="dropdown-content hidden"><button class="dropdown-item"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button><button class="dropdown-item dropdown-item-danger"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete</button></div></div>'; } },
      ];
      initTable('bookings-table', { data: DATA.getBookings(), columns: columns, pageSize: 10, emptyMessage: 'No bookings found' });
    }

    // Journal
    if (page === 'journal-ledger') {
      var jColumns = [
        { key: 'id', render: function (r) { return '<span class="font-mono text-xs text-white">' + escapeHtml(r.id) + '</span>'; } },
        { key: 'vehicle_number', render: function (r) { return '<span class="text-white">' + escapeHtml(r.vehicle_number) + '</span>'; } },
        { key: 'category_name' },
        { key: 'amount_collected', render: function (r) { return '<span class="text-emerald-400">' + formatCurrency(r.amount_collected) + '</span>'; } },
        { key: 'total_amount', render: function (r) { return '<span class="text-white">' + formatCurrency(r.total_amount) + '</span>'; } },
        { key: 'platform_name' },
        { key: 'status', render: function (r) { return statusBadge(r.status, true); } },
        { key: 'actions', render: function (r) { return '<div class="dropdown"><button class="btn btn-ghost btn-icon btn-sm dropdown-toggle" data-dropdown="jact-' + r.id + '"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button><div id="jact-' + r.id + '" class="dropdown-content hidden"><button class="dropdown-item">Edit</button><button class="dropdown-item dropdown-item-danger">Delete</button></div></div>'; } },
      ];
      initTable('journal-table', { data: DATA.getJournal(), columns: jColumns, pageSize: 10, emptyMessage: 'No journal entries found' });
    }

    // Expenses
    if (page === 'expenses') {
      var eColumns = [
        { key: 'invoice_number', render: function (r) { return '<span class="font-mono text-xs text-white">' + escapeHtml(r.invoice_number) + '</span>'; } },
        { key: 'vehicle_number', render: function (r) { return '<span class="text-white">' + escapeHtml(r.vehicle_number) + '</span>'; } },
        { key: 'category_name' },
        { key: 'amount', render: function (r) { return '<span class="text-red-400 font-medium">' + formatCurrency(r.amount) + '</span>'; } },
        { key: 'vendor' },
        { key: 'payment_mode_name' },
        { key: 'status', render: function (r) { return statusBadge(r.status, true); } },
        { key: 'actions', render: function (r) { return '<div class="dropdown"><button class="btn btn-ghost btn-icon btn-sm dropdown-toggle" data-dropdown="eact-' + r.id + '"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button><div id="eact-' + r.id + '" class="dropdown-content hidden"><button class="dropdown-item">Edit</button><button class="dropdown-item dropdown-item-danger">Delete</button></div></div>'; } },
      ];
      initTable('expenses-table', { data: DATA.getExpenses(), columns: eColumns, pageSize: 10, emptyMessage: 'No expenses found' });
    }

    // Settlements
    if (page === 'settlements') {
      var sd = DATA.getSettlementDashboard();
      if (sd) {
        var setKPI = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
        setKPI('stl-pending', formatCurrency(sd.total_pending));
        setKPI('stl-completed', formatCurrency(sd.total_completed));
        setKPI('stl-in-progress', formatCurrency(sd.total_in_progress));
        setKPI('stl-count-pending', sd.count_pending);
        setKPI('stl-count-completed', sd.count_completed);
        if (sd.monthly_trend) {
          renderBarChart('chart-settlement-trend', sd.monthly_trend.map(function (d) { return { label: d.month, value: d.settled }; }), { colors: ['#22c55e'] });
        }
      }
      var sColumns = [
        { key: 'settlement_id', render: function (r) { return '<span class="font-mono text-xs text-white">' + escapeHtml(r.settlement_id) + '</span>'; } },
        { key: 'vehicle_number' },
        { key: 'platform_name' },
        { key: 'total_amount', render: function (r) { return formatCurrency(r.total_amount); } },
        { key: 'net_amount', render: function (r) { return '<span class="text-emerald-400">' + formatCurrency(r.net_amount) + '</span>'; } },
        { key: 'status', render: function (r) { return statusBadge(r.status, true); } },
        { key: 'settlement_date', render: function (r) { return formatDate(r.settlement_date); } },
      ];
      initTable('settlements-table', { data: DATA.getSettlements(), columns: sColumns, pageSize: 10, emptyMessage: 'No settlements found' });
    }

    // Outstandings
    if (page === 'outstandings') {
      var oColumns = [
        { key: 'vehicle_number' },
        { key: 'platform_name' },
        { key: 'amount', render: function (r) { return formatCurrency(r.amount); } },
        { key: 'paid_amount', render: function (r) { return '<span class="text-emerald-400">' + formatCurrency(r.paid_amount) + '</span>'; } },
        { key: 'balance', render: function (r) { return '<span class="text-red-400">' + formatCurrency(r.amount - r.paid_amount) + '</span>'; } },
        { key: 'status', render: function (r) { return statusBadge(r.status, true); } },
        { key: 'priority', render: function (r) { return statusBadge(r.priority, false); } },
        { key: 'due_date', render: function (r) {
          var d = new Date(r.due_date);
          var isOverdue = d < new Date() && r.status !== 'paid';
          return '<span class="' + (isOverdue ? 'text-red-400' : 'text-secondary-300') + '">' + formatDate(r.due_date) + '</span>';
        } },
      ];
      initTable('outstandings-table', { data: DATA.getOutstandings(), columns: oColumns, pageSize: 10, emptyMessage: 'No outstandings found' });
    }

    // Fleet dashboard
    if (page === 'fleet-dashboard') {
      var fd = DATA.getFleetDashboard();
      if (fd && fd.fleet_health) {
        var fh = fd.fleet_health;
        var setFH = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
        setFH('fleet-health-score', fh.health_score + '%');
        setFH('fleet-insurance', fh.insurance_due);
        setFH('fleet-maintenance', fh.maintenance_due);
        setFH('fleet-permit', fh.permit_due);
        setFH('fleet-fitness', fh.fitness_due);
        setFH('fleet-pollution', fh.pollution_due);
        var hb = document.getElementById('fleet-health-bar');
        if (hb) hb.style.width = fh.health_score + '%';
      }
      if (fd && fd.alerts) {
        var fa = document.getElementById('fleet-alerts');
        if (fa) {
          fa.innerHTML = fd.alerts.map(function (a) {
            return '<div class="alert-item alert-' + a.type + '"><svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span class="text-sm">' + escapeHtml(a.message) + '</span></div>';
          }).join('');
        }
      }
      var vehColumns = [
        { key: 'vehicle_number', render: function (r) { return '<span class="font-mono text-xs text-white">' + escapeHtml(r.vehicle_number) + '</span>'; } },
        { key: 'brand' },
        { key: 'model' },
        { key: 'fuel_type' },
        { key: 'status', render: function (r) { return statusBadge(r.status, true); } },
        { key: 'health_score', render: function (r) { return '<span class="' + (r.health_score >= 70 ? 'text-emerald-400' : 'text-red-400') + '">' + r.health_score + '%</span>'; } },
        { key: 'total_revenue_ytd', render: function (r) { return formatCurrency(r.total_revenue_ytd); } },
        { key: 'total_expense_ytd', render: function (r) { return '<span class="text-red-400">' + formatCurrency(r.total_expense_ytd) + '</span>'; } },
      ];
      if (fd && fd.vehicles) initTable('fleet-vehicles-table', { data: fd.vehicles, columns: vehColumns, pageSize: 10, emptyMessage: 'No vehicles found' });
    }

    // Maintenance
    if (page === 'maintenance') {
      var mColumns = [
        { key: 'vehicle_number', render: function (r) { return '<span class="font-mono text-xs text-white">' + escapeHtml(r.vehicle_number) + '</span>'; } },
        { key: 'service_type' },
        { key: 'vendor_name' },
        { key: 'cost', render: function (r) { return formatCurrency(r.cost); } },
        { key: 'odometer_km', render: function (r) { return r.odometer_km.toLocaleString('en-IN') + ' km'; } },
        { key: 'status', render: function (r) { return statusBadge(r.status, true); } },
        { key: 'scheduled_date', render: function (r) { return formatDate(r.scheduled_date); } },
      ];
      initTable('maintenance-table', { data: DATA.getMaintenance(), columns: mColumns, pageSize: 10, emptyMessage: 'No maintenance records found' });
    }

    // Service Schedules
    if (page === 'service-schedules') {
      var scColumns = [
        { key: 'vehicle_number', render: function (r) { return '<span class="font-mono text-xs text-white">' + escapeHtml(r.vehicle_number) + '</span>'; } },
        { key: 'service_type' },
        { key: 'status', render: function (r) { return statusBadge(r.status, true); } },
        { key: 'odometer_km', render: function (r) { return r.odometer_km.toLocaleString('en-IN') + ' km'; } },
        { key: 'estimated_cost', render: function (r) { return formatCurrency(r.estimated_cost); } },
        { key: 'assigned_to' },
        { key: 'scheduled_date', render: function (r) { return formatDate(r.scheduled_date); } },
      ];
      initTable('schedules-table', { data: DATA.getSchedules(), columns: scColumns, pageSize: 10, emptyMessage: 'No schedules found' });
    }

    // Analytics
    if (page === 'analytics') {
      var ad = DATA.getAnalytics();
      if (ad) {
        if (ad.revenue) renderBarChart('chart-analytics-revenue', ad.revenue.map(function (d) { return { label: d.month, value: d.total }; }));
        if (ad.expenses) renderBarChart('chart-analytics-expenses', ad.expenses.map(function (d) { return { label: d.month, value: d.total }; }));
        if (ad.utilization) {
          renderBarChart('chart-analytics-utilization', ad.utilization.map(function (d) { return { label: d.month, value: d.rate }; }));
        }
        if (ad.top_platforms && ad.cost_breakdown) {
          renderPieChart('chart-analytics-platform', ad.top_platforms.map(function (d) { return { label: d.name, value: d.revenue }; }));
          renderPieChart('chart-analytics-cost', ad.cost_breakdown.map(function (d) { return { label: d.category, value: d.amount }; }));
        }
      }
    }

    // Reports
    if (page === 'reports') {
      var rColumns = [
        { key: 'type', render: function (r) { return '<span class="text-white font-medium">' + escapeHtml(r.type) + '</span>'; } },
        { key: 'period' },
        { key: 'status', render: function (r) { return statusBadge(r.status, true); } },
        { key: 'total_rows', render: function (r) { return r.total_rows + ' rows'; } },
        { key: 'generated_at', render: function (r) { return formatDate(r.generated_at); } },
        { key: 'actions', render: function () { return '<button class="btn btn-soft btn-sm">Download</button>'; } },
      ];
      initTable('reports-table', { data: DATA.getReports(), columns: rColumns, pageSize: 10, emptyMessage: 'No reports found' });
    }

    // Notifications
    if (page === 'notifications') {
      var nData = DATA.getNotifications();
      var nList = document.getElementById('notifications-list');
      if (nList && nData) {
        nList.innerHTML = nData.map(function (n) {
          var icons = { info: '#183eeb', warning: '#f59e0b', success: '#22c55e', error: '#ef4444' };
          return '<div class="activity-item" style="opacity:' + (n.is_read ? '0.6' : '1') + '"><span class="activity-dot" style="background:' + (icons[n.type] || '#64748b') + '"></span><div class="activity-content"><div class="text-sm font-medium">' + escapeHtml(n.title) + '</div><div class="text-xs text-secondary-400 mt-0.5">' + escapeHtml(n.description) + '</div><div class="text-xs text-secondary-500 mt-1">' + formatDateTime(n.created_at) + '</div></div></div>';
        }).join('');
      }
    }

    // Operations
    if (page === 'operations') {
      var tasks = DATA.getTasks();
      var taskList = document.getElementById('tasks-list');
      if (taskList && tasks) {
        taskList.innerHTML = tasks.map(function (t) {
          return '<div class="flex items-center justify-between p-3 rounded-lg bg-surface-light/50 border border-border"><div class="flex items-center gap-3"><span class="w-2 h-2 rounded-full ' + (t.priority === 'high' || t.priority === 'critical' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500') + '"></span><div><div class="text-sm">' + escapeHtml(t.title) + '</div><div class="text-xs text-secondary-500">' + escapeHtml(t.assigned_to) + ' · Due ' + formatDate(t.due_date) + '</div></div></div>' + statusBadge(t.status, true) + '</div>';
        }).join('');
      }
    }

    // Automation
    if (page === 'automation') {
      var rulesEl = document.getElementById('automation-rules');
      if (rulesEl) {
        rulesEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><div class="empty-state-title">No automation rules configured</div><div class="empty-state-text">Set up automated workflows for settlements, notifications, and reports</div></div>';
      }
    }

    // Masters pages (customers, vendors, drivers, vehicles, vehicle-owners, accounts, platform-masters, expense-categories, payment-modes)
    // These all follow the same pattern
    var masterMappings = {
      'accounts': { label: 'Accounts', filter: 'accounts', emptyMsg: 'No accounts found' },
      'expense-categories': { label: 'Expense Categories', filter: 'expense_categories', emptyMsg: 'No expense categories found' },
      'payment-modes': { label: 'Payment Modes', filter: 'payment_modes', emptyMsg: 'No payment modes found' },
      'fuel-types': { label: 'Fuel Types', filter: 'fuel_types', emptyMsg: 'No fuel types found' },
      'platforms': { label: 'Platforms', filter: 'platforms', emptyMsg: 'No platforms found' },
      'journal-categories': { label: 'Journal Categories', filter: 'journal_categories', emptyMsg: 'No journal categories found' },
      'outstanding-priorities': { label: 'Outstanding Priorities', filter: 'outstanding_priorities', emptyMsg: 'No outstanding priorities found' },
      'platform-categories': { label: 'Platform Categories', filter: 'platform_categories', emptyMsg: 'No platform categories found' },
    };

    var masterInfo = masterMappings[page];
    if (masterInfo) {
      var allMasterData = DATA.getMasterData();
      var masterData = masterInfo.filter ? (allMasterData[masterInfo.filter] || []) : [];
      var masterCols = [
        { key: 'id', render: function (r) { return '<span class="font-mono text-xs text-secondary-400">' + escapeHtml(r.id) + '</span>'; } },
        { key: 'name' },
        { key: 'status', render: function (r) { return statusBadge(r.is_active ? 'active' : 'inactive', true); } },
      ];
      initTable('masters-table', { data: masterData, columns: masterCols, pageSize: 10, emptyMessage: masterInfo.emptyMsg });
    }

    // Settings
    if (page === 'settings') {
      var settings = DATA.getSettings();
      if (settings) {
        var setVal = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
        setVal('settings-company-name', settings.company.name);
        setVal('settings-company-address', settings.company.address);
        setVal('settings-company-gst', settings.company.gst);
        setVal('settings-company-pan', settings.company.pan);
        setVal('settings-company-email', settings.company.contact_email);
        setVal('settings-company-phone', settings.company.contact_phone);
        setVal('settings-currency', settings.financial.currency);
        setVal('settings-tax-rate', settings.financial.tax_rate + '%');
        setVal('settings-tds-rate', settings.financial.tds_rate + '%');
        setVal('settings-commission-rate', settings.financial.commission_rate + '%');
        setVal('settings-refresh-interval', settings.dashboard.refresh_interval + 's');
        setVal('settings-date-format', settings.preferences.date_format);
        setVal('settings-timezone', settings.preferences.timezone);
        setVal('settings-language', settings.preferences.language);
      }
    }
  });
})();
