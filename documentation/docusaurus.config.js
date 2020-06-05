module.exports = {
    title: 'Fast-CSV',
    tagline: 'CSV Parser and Formatter',
    url: 'https://c2fo.github.io',
    baseUrl: '/fast-csv/',
    favicon: 'img/favicon.ico',
    organizationName: 'C2FO', // Usually your GitHub org/user name.
    projectName: 'fast-csv', // Usually your repo name.
    themeConfig: {
        navbar: {
            title: 'Fast-CSV',
            logo: {
                alt: 'Fast-CSV Logo',
                src: 'img/logo.svg',
            },
            links: [
                {
                    to: 'docs/introduction/getting-started',
                    activeBasePath: 'docs',
                    label: 'Docs',
                    position: 'left',
                },
                { to: 'blog', label: 'Blog', position: 'left' },
                {
                    href: 'https://github.com/C2FO/fast-csv',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Getting Started',
                            to: 'docs/introduction/getting-started',
                        },
                        {
                            label: 'Parsing',
                            to: 'docs/parsing/getting-started',
                        },
                        {
                            label: 'Formatting',
                            to: 'docs/formatting/getting-started',
                        },
                    ],
                },
                {
                    title: 'Social',
                    items: [
                        {
                            label: 'Blog',
                            to: 'blog',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/C2FO/fast-csv',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Pollen, Inc. Built with Docusaurus.`,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    editUrl: 'https://github.com/C2FO/fast-csv/edit/master/documentation/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
};
