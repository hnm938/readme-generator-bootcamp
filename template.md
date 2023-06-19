{{#if showTitle}}
# {{title}}
---
{{/if}}

<!--LICENSE_BADGE-->
<!--VERSION_BADGE-->

<!--TABLE_OF_CONTENTS-->

{{#if showDescription}}
## Description
{{description}}
{{/if}}

{{#if showDependencies}}
## Dependencies
{{dependencies}}
{{/if}}

{{#if showInstallation}}
## Installation
{{installation}}
{{/if}}

{{#if showUsage}}
## Usage
{{usage}}
{{/if}}

{{#if contributing}}
## Contributing
{{contributing}}
{{/if}}

{{#if tests}}
## Tests
{{tests}}
{{/if}}

{{#if showAuthors}}
## Authors
{{#each authors}}
- {{this}}
{{/each}}
{{/if}}

{{#if showVersionHistory}}
---
## Version History
{{versionHistory}}
---
{{/if}}

{{#if acknowledgments}}
## Acknowledgments
{{#each acknowledgments}}
- [{{this.name}}]({{this.link}})
{{/each}}
{{/if}}

{{#if (and githubUsername email)}}
## Questions
{{#if showContact}}
{{contact}}
{{/if}}

{{#if showGithub}}
- GitHub: [@{{githubUsername}}](https://github.com/{{githubUsername}})
{{/if}}

{{#if showEmail}}
- Email: {{email}}
{{/if}}
{{/if}}

## License
Licensed under the {{license}} license