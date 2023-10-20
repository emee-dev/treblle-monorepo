import React from 'react';
import { DocsThemeConfig } from 'nextra-theme-docs';

//  npx browserslist@latest --update-db
const config: DocsThemeConfig = {
  logo: <span>Treblle Express 🚀</span>,
  project: {
    link: 'https://github.com/emee-dev/treblle-monorepo/tree/main/apps/sdk',
  },
  chat: {
    link: 'https://discord.com',
  },
  docsRepositoryBase: 'https://github.com/emee-dev/treblle-monorepo',
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{' '}
        <a href="/" target="_blank">
          Treblle Express 🚀
        </a>
        .
      </span>
    ),
  },
};

export default config;
