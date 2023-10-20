import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

//  npx browserslist@latest --update-db
const config: DocsThemeConfig = {
	logo: <span>Treblle Express JS</span>,
	project: {
		link: "https://github.com/emee_dev/nextra-docs-template",
	},
	chat: {
		link: "https://discord.com",
	},
	docsRepositoryBase: "https://github.com/shuding/nextra-docs-template",
	footer: {
		text: (
			<span>
				MIT {new Date().getFullYear()} ©{" "}
				<a href="/" target="_blank">
					API SIMPLIFIED 🚀
				</a>
				.
			</span>
		),
	},
};

export default config;
