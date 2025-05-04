import linkGroups from "@example/data/examplesData";
import createStyles from "@example/styles";
import { createFavIcon } from "@example/utilities/gui/styles";
import { REPO_URL } from "./constants";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  // Create sticky header container
  const stickyHeader = document.createElement("div");
  stickyHeader.className = "sticky-header";

  // Create title section
  const titleSection = document.createElement("div");
  titleSection.className = "title-section";

  const title = document.createElement("h1");
  title.textContent = "ProtoGL Examples";
  title.className = "title";

  const subTitle = document.createElement("p");
  subTitle.textContent = "A collection of examples using ProtoGL";
  subTitle.className = "subtitle";

  titleSection.appendChild(title);
  titleSection.appendChild(subTitle);

  // Create GitHub link
  const githubLink = document.createElement("a");
  githubLink.href = REPO_URL;
  githubLink.className = "github-link";
  githubLink.target = "_blank";
  githubLink.rel = "noopener noreferrer";
  githubLink.title = "View source on GitHub";

  // GitHub SVG icon
  githubLink.innerHTML = `
    <svg height="28" width="28" viewBox="0 0 16 16" version="1.1" aria-hidden="true">
      <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
    </svg>
  `;

  // Create search bar
  const searchContainer = document.createElement("div");
  searchContainer.className = "search-container";

  const searchIcon = document.createElement("span");
  searchIcon.className = "search-icon";
  searchIcon.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#6b7280"/>
      </svg>
    `;

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search examples...";
  searchInput.className = "search-input";

  searchContainer.appendChild(searchIcon);
  searchContainer.appendChild(searchInput);

  // Add all elements to sticky header
  const headerContent = document.createElement("div");
  headerContent.className = "header-content";

  headerContent.appendChild(titleSection);
  headerContent.appendChild(searchContainer);
  headerContent.appendChild(githubLink);

  stickyHeader.appendChild(headerContent);
  // stickyHeader.appendChild(searchContainer);

  // Create main content
  const mainContent = document.createElement("main");
  mainContent.className = "main-content";

  // Function to render all link groups
  const renderAllLinkGroups = () => {
    mainContent.innerHTML = "";

    linkGroups.forEach((group) => {
      const groupSection = createGroupSection(group);
      mainContent.appendChild(groupSection);
    });
  };

  // Create a group section
  const createGroupSection = (group) => {
    const groupSection = document.createElement("section");
    groupSection.className = "group-section";

    const groupTitle = document.createElement("h2");
    groupTitle.className = "group-title";
    groupTitle.textContent = group.topic;

    const linkContainer = document.createElement("div");
    linkContainer.className = "link-container";

    group.links.forEach((link) => {
      const linkCard = createLinkCard(link);
      linkContainer.appendChild(linkCard);
    });

    groupSection.appendChild(groupTitle);
    groupSection.appendChild(linkContainer);

    return groupSection;
  };

  // Create a link card
  const createLinkCard = (link) => {
    const linkElement = document.createElement("div");
    linkElement.className = "link-card";
    linkElement.dataset.title = link.title.toLowerCase();
    linkElement.dataset.description = link.description.toLowerCase();

    const linkTitle = document.createElement("h3");
    linkTitle.className = "link-title";

    const linkAnchor = document.createElement("a");
    linkAnchor.href = link.url;
    linkAnchor.textContent = link.title;
    linkAnchor.target = "_blank";
    linkAnchor.rel = "noopener noreferrer";

    linkTitle.appendChild(linkAnchor);

    const linkDescription = document.createElement("p");
    linkDescription.className = "link-description";
    linkDescription.textContent = link.description;

    const linkSource = document.createElement("a");
    linkSource.className = "link-source";
    linkSource.href = `${REPO_URL}/tree/main/example/src/${link.url}/index.ts`;
    linkSource.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 7.82959L18.6965 9.35641C20.239 10.7447 21.0103 11.4389 21.0103 12.3296C21.0103 13.2203 20.239 13.9145 18.6965 15.3028L17 16.8296" stroke="#8e9095" stroke-width="1.5" stroke-linecap="round"></path> <path opacity="0.5" d="M13.9868 5L10.0132 19.8297" stroke="#8e9095" stroke-width="1.5" stroke-linecap="round"></path> <path d="M7.00005 7.82959L5.30358 9.35641C3.76102 10.7447 2.98975 11.4389 2.98975 12.3296C2.98975 13.2203 3.76102 13.9145 5.30358 15.3028L7.00005 16.8296" stroke="#8e9095" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>`;
    linkSource.target = "_blank";
    linkSource.rel = "noopener noreferrer";
    linkSource.title = "View source code on GitHub";
    linkSource.addEventListener("click", (e) => e.stopPropagation());

    const linkInfo = document.createElement("div");
    linkInfo.className = "link-info";
    linkInfo.appendChild(linkDescription);
    linkInfo.appendChild(linkSource);

    linkElement.appendChild(linkTitle);
    linkElement.appendChild(linkInfo);

    linkElement.onclick = (e) => {
      console.log("i have been clicked");
      linkAnchor.click();
      e.stopPropagation();
    };

    return linkElement;
  };

  // Search functionality
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === "") {
      renderAllLinkGroups();
      return;
    }

    mainContent.innerHTML = "";

    // Create a section for search results
    const resultsSection = document.createElement("section");
    resultsSection.className = "group-section";

    const resultsTitle = document.createElement("h2");
    resultsTitle.className = "group-title";
    resultsTitle.textContent = "Search Results";

    const resultsContainer = document.createElement("div");
    resultsContainer.className = "link-container";

    let resultsFound = 0;

    // Search through all links in all groups
    linkGroups.forEach((group) => {
      group.links.forEach((link) => {
        if (
          link.title.toLowerCase().includes(searchTerm) ||
          link.description.toLowerCase().includes(searchTerm)
        ) {
          const linkCard = createLinkCard(link);
          resultsContainer.appendChild(linkCard);
          resultsFound++;
        }
      });
    });

    if (resultsFound === 0) {
      const noResults = document.createElement("div");
      noResults.className = "no-results";
      noResults.textContent = `No examples found matching "${searchTerm}"`;
      resultsContainer.appendChild(noResults);
    } else {
      resultsTitle.textContent = `Search Results (${resultsFound})`;
    }

    resultsSection.appendChild(resultsTitle);
    resultsSection.appendChild(resultsContainer);
    mainContent.appendChild(resultsSection);
  });

  // Favicon
  createFavIcon();
  // Initial render
  renderAllLinkGroups();

  // Add main content to the root
  // Add padding to account for the sticky header
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "content-wrapper";
  contentWrapper.appendChild(mainContent);

  // Add sticky header
  root.appendChild(stickyHeader);
  root.appendChild(contentWrapper);

  // Create the CSS
  createStyles();
});
