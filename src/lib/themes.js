export const DASHBOARD_THEMES = {
    default: {
        name: 'Default (Vercel)',
        colors: ['#0070f3', '#7928ca', '#f81ce5', '#ff0080', '#eb367f', '#79ffe1'],
        background: 'var(--geist-background)',
    },
    ocean: {
        name: 'Oceanic',
        colors: ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'],
        background: '#f0f9ff',
    },
    forest: {
        name: 'Forest',
        colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7'],
        background: '#f1f8f4',
    },
    sunset: {
        name: 'Sunset',
        colors: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'],
        background: '#fff9f0',
    },
    monochrome: {
        name: 'Monochrome',
        colors: ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#eeeeee'],
        background: '#ffffff',
    }
};

export const getThemeColors = (themeKey) => {
    return DASHBOARD_THEMES[themeKey]?.colors || DASHBOARD_THEMES.default.colors;
};
