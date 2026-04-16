const PAGE_PATHS = {
  home_admin: '/admin',
  home_health: '/cuidados',
  queue_admin: '/admin/queue',
  queue_health: '/cuidados/queue',
  families: '/admin/families',
  children_admin: '/admin/children',
  children_health: '/cuidados/children',
  my_patients: '/cuidados/my-patients',
  my_profile: '/cuidados/my-profile',
  projects: '/admin/projects',
  warehouse: '/admin/warehouse',
  collaborators: '/admin/collaborators',
  reports: '/admin/reports',
  resource_sources: '/admin/resource-sources',
  wallets: '/admin/wallets',
  incomes: '/admin/incomes',
  notifications: '/admin/notifications',
};

const DEFAULT_PAGES_BY_ROLE = {
  admin: [
    'home_admin',
    'queue_admin',
    'families',
    'children_admin',
    'projects',
    'warehouse',
    'collaborators',
    'reports',
    'resource_sources',
    'wallets',
    'incomes',
    'notifications',
  ],
  operational: [
    'home_admin',
    'queue_admin',
    'families',
    'children_admin',
    'projects',
    'warehouse',
  ],
  health: [
    'home_health',
    'children_health',
    'my_patients',
    'my_profile',
  ],
};

const DEFAULT_FEATURES_BY_ROLE = {
  admin: [
    'collaborators.create',
    'collaborators.edit',
    'collaborators.delete',
    'collaborators.status',
    'collaborators.access.manage',
  ],
  operational: [],
  health: [],
};

export function getDefaultAccessForRole(role) {
  return {
    pages: [...(DEFAULT_PAGES_BY_ROLE[role] || [])],
    features: [...(DEFAULT_FEATURES_BY_ROLE[role] || [])],
  };
}

export const ACCESS_FEATURES = {
  collaboratorsCreate: 'collaborators.create',
  collaboratorsEdit: 'collaborators.edit',
  collaboratorsDelete: 'collaborators.delete',
  collaboratorsStatus: 'collaborators.status',
  collaboratorsAccessManage: 'collaborators.access.manage',
};

export const ACCESS_CONFIG_OPTIONS = {
  pages: [
    { value: 'queue_admin', label: 'Admin / Fila de Espera' },
    { value: 'families', label: 'Admin / Cadastro de Famílias' },
    { value: 'children_admin', label: 'Admin / Crianças' },
    { value: 'projects', label: 'Admin / Projetos' },
    { value: 'warehouse', label: 'Admin / Almoxarifado' },
    { value: 'collaborators', label: 'Admin / Colaboradores' },
    { value: 'reports', label: 'Admin / Relatórios' },
    { value: 'resource_sources', label: 'Admin / Fontes de Recursos' },
    { value: 'wallets', label: 'Admin / Carteiras / Fundos' },
    { value: 'incomes', label: 'Admin / Entradas de Receita' },
    { value: 'notifications', label: 'Admin / Notificações' },
    { value: 'queue_health', label: 'Cuidados / Fila' },
    { value: 'my_patients', label: 'Cuidados / Meus Pacientes' },
    { value: 'my_profile', label: 'Cuidados / Meu Perfil / Produção' },
  ],
  features: [
    { value: ACCESS_FEATURES.collaboratorsCreate, label: 'Colaboradores / Criar' },
    { value: ACCESS_FEATURES.collaboratorsEdit, label: 'Colaboradores / Editar' },
    { value: ACCESS_FEATURES.collaboratorsDelete, label: 'Colaboradores / Excluir' },
    { value: ACCESS_FEATURES.collaboratorsStatus, label: 'Colaboradores / Alterar Status' },
    { value: ACCESS_FEATURES.collaboratorsAccessManage, label: 'Colaboradores / Configurar Acessos' },
  ],
};

export function getAccessConfigOptionsForRole(role) {
  const isHealth = role === 'health';
  const pages = ACCESS_CONFIG_OPTIONS.pages.filter((opt) => {
    if (opt.value === 'my_patients' || opt.value === 'my_profile') return isHealth;
    return true;
  });
  return {
    pages,
    features: ACCESS_CONFIG_OPTIONS.features,
  };
}

export function getPagePathByKey(pageKey) {
  return PAGE_PATHS[pageKey] || null;
}

export function getPageKeyByPath(pathname) {
  if (!pathname) return null;
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (normalized.startsWith('/admin/users') || normalized.startsWith('/admin/dashboard/users')) {
    return 'collaborators';
  }
  const entries = Object.entries(PAGE_PATHS).sort((a, b) => b[1].length - a[1].length);
  for (const [key, path] of entries) {
    if (normalized === path || normalized.startsWith(`${path}/`)) return key;
  }
  return null;
}

function normalizeOverrides(rawOverrides) {
  const source = rawOverrides && typeof rawOverrides === 'object' ? rawOverrides : {};
  return {
    allow_pages: Array.isArray(source.allow_pages) ? source.allow_pages : [],
    deny_pages: Array.isArray(source.deny_pages) ? source.deny_pages : [],
    allow_features: Array.isArray(source.allow_features) ? source.allow_features : [],
    deny_features: Array.isArray(source.deny_features) ? source.deny_features : [],
  };
}

export function resolveAccess(authUser) {
  const role = authUser?.role || 'health';
  const basePages = new Set(DEFAULT_PAGES_BY_ROLE[role] || []);
  const baseFeatures = new Set(DEFAULT_FEATURES_BY_ROLE[role] || []);
  const overrides = normalizeOverrides(authUser?.access_overrides);

  overrides.allow_pages.forEach((key) => basePages.add(key));
  overrides.deny_pages.forEach((key) => basePages.delete(key));
  overrides.allow_features.forEach((key) => baseFeatures.add(key));
  overrides.deny_features.forEach((key) => baseFeatures.delete(key));

  // Regra fixa: páginas assistenciais "Meus Pacientes" e "Meu Perfil / Produção"
  // são exclusivas do perfil de saúde, mesmo com overrides legados.
  if (role !== 'health') {
    basePages.delete('my_patients');
    basePages.delete('my_profile');
  }

  return {
    role,
    pages: Array.from(basePages),
    features: Array.from(baseFeatures),
  };
}

export function hasPageAccess(authUser, pageKey) {
  if (!pageKey) return true;
  return resolveAccess(authUser).pages.includes(pageKey);
}

export function hasFeatureAccess(authUser, featureKey) {
  if (!featureKey) return true;
  return resolveAccess(authUser).features.includes(featureKey);
}

export function canAccessPath(authUser, pathname) {
  if (!pathname) return true;
  if (pathname.startsWith('/admin/users/add-user') || pathname.startsWith('/admin/dashboard/users/add-user')) {
    return (
      hasFeatureAccess(authUser, ACCESS_FEATURES.collaboratorsCreate) ||
      hasFeatureAccess(authUser, ACCESS_FEATURES.collaboratorsEdit)
    );
  }
  const pageKey = getPageKeyByPath(pathname);
  if (!pageKey) return true;
  return hasPageAccess(authUser, pageKey);
}
