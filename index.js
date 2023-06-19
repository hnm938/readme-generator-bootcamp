#!/usr/bin/env node
import fs from "fs";
import inquirer from "inquirer";
import handlebars from "handlebars";

// User Prompts
const prompts = [
  {
    name: "tableOfContents",
    type: "confirm",
    message: "Do you want to include a table of contents?",
    default: true,
  },
  {
    name: "version",
    message: "Enter the current application version:",
  },
  {
    name: "title",
    message: "Enter the project title:",
  },
  {
    name: "description",
    message: "Enter a brief description:",
  },
  {
    name: "dependencies",
    message: "Enter project dependencies (comma-separated):",
  },
  {
    name: "usage",
    message: "Enter usage information: ",
  },
  {
    name: "installation",
    message: "Enter installation instructions:",
  },
  {
    name: "contributing",
    message: "Enter information on how to contribute (optional):",
    type: "editor", // Set the prompt type to EditorPrompt
    format: "markdown", // Specify the format as markdown
    default: "Edit your contribution guidelines here", // Provide a default value
  },
  {
    name: "tests",
    message: "Enter test commands:",
  },
  {
    name: "authors",
    message: "Enter author(s) information (comma-separated):",
  },
  {
    name: "githubUsername",
    message: "Enter your GitHub username:",
  },
  {
    name: "email",
    message: "Enter your email address:",
  },
  {
    name: "contact",
    message: "Enter description of contact: "
  },
  {
    name: "versionHistory",
    message:
      "Enter version history (format: version1::change1; change2, version2::change1; change2, ...):",
  },
  {
    name: "license",
    message: "Select a license:",
    type: "list",
    choices: ["MIT", "ISC", "Apache", "BSD", "CC"],
    default: "MIT",
  },
  {
    name: "acknowledgments",
    message: "Enter acknowledgments or credits (format: name1::link1, ...):",
  },
];

// Map propmt names to flags
const flags = {
  title: "showTitle",
  description: "showDescription",
  dependencies: "showDependencies",
  installation: "showInstallation",
  authors: "showAuthors",
  versionHistory: "showVersionHistory",
  license: "showLicense",
  contributing: "showContributing",
  tests: "showTests",
  usage: "showUsage",
  githubUsername: "showGithub",
  email: "showEmail",
  contact: "showContact",
};

inquirer
  .prompt(prompts)
  .then((answers) => {
    if (answers.contributing) {
      // Save the contributing content to a temporary file
      const tempFile = "contributing.md";
      fs.writeFileSync(tempFile, answers.contributing);

      // Wait for user input to proceed
      process.stdin.once("data", () => {
        // Remove the temporary file
        fs.unlinkSync(tempFile);
      });
    }
    const readmeContent = generateReadme(answers);
    fs.writeFileSync("README.md", readmeContent);
    console.log("README.md file generated successfully!");
  })
  .catch((error) => {
    console.error("Error:", error);
  });

function generateReadme(data) {
  // Read the template file
  const templateFile = fs.readFileSync("template.md", "utf8");

  // Compile the template
  const template = handlebars.compile(templateFile);

  // Register a Handlebars helper for logical AND
  handlebars.registerHelper("and", function () {
    // Retrieve all the arguments passed to the helper
    const args = Array.prototype.slice.call(arguments);

    // Check if all arguments are truthy values
    for (let i = 0; i < args.length - 1; i++) {
      if (!args[i]) {
        return false;
      }
    }

    return true;
  });

  // Process acknowledgments
  const acknowledgments = processAcknowledgments(data.acknowledgments);

  // Process version history
  const versionHistory = processVersionHistory(data.versionHistory);

  // Convert version history to a formatted string
  const versionHistoryString = formatVersionHistory(versionHistory);

  // Add flags for each prompt
  const dataWithFlags = { ...data };
  Object.keys(flags).forEach((prompt) => {
    dataWithFlags[flags[prompt]] = !!data[prompt];
  });

  // Generate the README content using the provided data and template
  let readmeContent = template({
    ...dataWithFlags,
    acknowledgments,
    versionHistory: versionHistoryString,
  });

  // Check if table of contents is enabled
  if (data.tableOfContents) {
    // Generate table and insert it into README
    const tableOfContents = generateTableOfContents(readmeContent);
    readmeContent = insertTableOfContents(readmeContent, tableOfContents);
  }

  // Add license badge and notice
  const versionBadge = generateVersionBadge(data.version);
  const licenseBadge = generateLicenseBadge(data.license);
  readmeContent = insertBadges(readmeContent, licenseBadge + versionBadge);

  return readmeContent;
}

function generateVersionBadge(version) {
  const versionBadge = `[![Version](https://img.shields.io/badge/Version-${version}-blue.svg)]`;
  return versionBadge;
}

function generateLicenseBadge(license) {
  let licenseBadge = "";
  switch (license) {
    case "Apache":
      licenseBadge =
        "[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)";
      break;
    case "BSD":
      licenseBadge =
        "[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)";
      break;
    case "MIT":
      licenseBadge =
        "[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)";
      break;
    case "CC":
      licenseBadge =
        "[![License](https://img.shields.io/badge/License-CC--BY--4.0-brightgreen.svg)](https://creativecommons.org/licenses/by/4.0/)";
      break;
    case "ISC":
      licenseBadge =
        "[![License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)";
      break;
    default:
      break;
  }
  return licenseBadge;
}

function insertBadges(readmeContent, badges) {
  const licenseBadgePlaceholder = "<!--LICENSE_BADGE-->";
  return readmeContent.includes(licenseBadgePlaceholder)
    ? readmeContent.replace(licenseBadgePlaceholder, badges)
    : readmeContent;
}

function generateTableOfContents(readmeContent) {
  // Match headers in readmeContent
  const headers = readmeContent.match(/^#{2,}\s+.+/gm);
  if (!headers) {
    return "";
  }

  // Generate table of contents
  const tableOfContents = headers.map((header) => {
    //
    const level = header.match(/^#{2,}/)[0].length; // Find header level, h1, h2, h3 by finding how many # there are at the start of the line
    const text = header.replace(/^#{2,}\s+/, ""); // Remove the #'s to convert the header to regular text
    const indentation = "  ".repeat(level - 2);
    return `${indentation}- [${text}](#${generateAnchor(text)})`;
  });

  return tableOfContents.join("\n");
}

function insertTableOfContents(readmeContent, tableOfContents) {
  const placeholder = "<!--TABLE_OF_CONTENTS-->";
  const tableOfContentsSection = `\n\n## Table of Contents\n\n${tableOfContents}\n\n`;
  return readmeContent.includes(placeholder)
    ? readmeContent.replace(placeholder, tableOfContentsSection)
    : readmeContent + tableOfContentsSection;
}

// Simple function to generate a markdown list anchor
function generateAnchor(text) {
  return text
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/[^\w-]/g, "");
}

// Renders all inputted acknowledgements
function processAcknowledgments(rawAcknowledgments) {
  const acknowledgments = [];
  const acknowledgmentPairs = rawAcknowledgments.split(",");

  acknowledgmentPairs.forEach((pair) => {
    const [name, link] = pair.split("::");
    if (name && link) {
      acknowledgments.push({ name: name.trim(), link: link.trim() });
    }
  });

  return acknowledgments;
}

function processVersionHistory(rawVersionHistory) {
  const versionHistory = [];
  const versionEntries = rawVersionHistory.split(",");

  versionEntries.forEach((entry) => {
    const [version, changes] = entry.split("::");
    if (version && changes) {
      versionHistory.push({ version: version.trim(), changes: changes.trim() });
    }
  });

  return versionHistory;
}

function formatVersionHistory(versionHistory) {
  let versionHistoryString = "";
  versionHistory.forEach((entry) => {
    versionHistoryString += `- ### Version ${entry.version}\n`;
    const changesList = entry.changes
      .split(";")
      .map((change) => `\t- ${change.trim()}`)
      .join("\n");
    versionHistoryString += `${changesList}\n\n`;
  });
  return versionHistoryString;
}
